# Lint 도구 현대화

> 이 문서는 수명이 끝난 ESLint 8을 10으로 올리고 flat config로 이전하면서 확인한 문제, 설정 결정, 그 과정에서 드러난 코드 결함 및 검증 결과를 기록합니다.

## 결론

- ESLint를 `8.57.1`에서 `10.10.0`으로 올리고, 14개의 `.eslintrc.js`를 루트의 `eslint.config.mjs` 하나로 통합했습니다.
- 방치된 플러그인 3개를 유지보수되는 대체재로 교체했습니다.
- 패키지별로 중복 선언되던 lint 의존성 91개를 루트로 통합했습니다.
- lint 위반이 297건에서 2건으로 줄었습니다.
- 이 과정에서 실제 버그 3건을 발견했고 2건을 고쳤습니다. 나머지 1건은 런타임 동작이 바뀌므로 별도 작업으로 남겼습니다.
- 작업은 성격에 따라 세 커밋으로 나눴습니다: `975e212`(포맷), `1349e41`(도구 이전), `75e0711`(코드 수정).

## 왜 도구를 올려야 했는가

기존 저장소는 ESLint `8.57.1`과 `.eslintrc.js` 형식을 쓰고 있었습니다. 2026-09-14 기준 상황은 다음과 같습니다.

| 시점 | 내용 |
| --- | --- |
| 2024-04 | ESLint 9에서 flat config가 기본이 되고 eslintrc 방식이 deprecated |
| 2026-02 | ESLint 10에서 eslintrc 방식이 **완전히 제거** |
| 2026-08-06 | ESLint 9 지원 종료 |

즉 `.eslintrc.js`는 상위에 더 이상 존재하지 않는 형식이고, 설정을 다시 쓰지 않으면 ESLint를 올릴 수 없는 상태였습니다. 버전이 낮은 게 문제가 아니라 **더 올릴 수 없는 구조에 갇혀 있던 것**이 문제였습니다.

플러그인 상태도 함께 확인했습니다.

| 패키지 | 이전 | 상태 | 대체 |
| --- | --- | --- | --- |
| `eslint-plugin-import` | 2.32.0 | peer가 ESLint 9까지만 | `eslint-plugin-import-x` 4.17.1 |
| `eslint-plugin-header` | 3.1.1 | 2022-06-17 이후 발행 없음 | `eslint-plugin-license-header` 0.9.0 |
| `eslint-plugin-no-null` | 1.0.2 | 2022-06-17 이후 발행 없음 | `eslint-plugin-unicorn` 74.0.0 |
| `eslint-config-prettier` | 8.10.2 | 2개 메이저 뒤 | 10.1.8 |

`@typescript-eslint`(8.70.0)와 `prettier`(3.9.6)는 이미 최신이었습니다.

## lint가 보고하던 1001줄의 실제 구성

작업 전 `yarn lint`는 1001줄을 출력하며 13개 패키지 전부 실패했습니다. 분류하면 다음과 같았습니다.

| 분류 | 건수 | 성격 |
| --- | --- | --- |
| prettier 포맷 위반 | 515 | 자동 수정 가능 |
| 규칙명을 찾지 못함 | 28 | 없어진 규칙을 참조하는 낡은 주석 |
| Parsing error | 13 | 파일을 아예 읽지 못함 |
| 실제 코드 위반 | 나머지 | `no-unused-vars` 등 |

중요한 점은 **실제 코드 위반이 그동안 보이지 않았던 것이 아니라는 사실**입니다. `no-unused-vars`는 70건, `no-explicit-any`는 40건이 이전에도 보고되고 있었습니다. 문제는 515건의 포맷 위반이 신호를 덮었고, lint가 항상 실패하니 "원래 실패하는 것"으로 취급되어 아무도 손대지 않는 상태였다는 것입니다.

## 처음부터 꺼져 있던 규칙

구 설정의 `extends`는 다음 한 줄이었습니다.

```js
extends: ['plugin:@typescript-eslint/recommended'],
```

**`eslint:recommended`가 빠져 있습니다.** TypeScript 전용 규칙만 켜고 ESLint 본체의 기본 권장 규칙은 한 번도 켠 적이 없었습니다. flat config에 `js.configs.recommended`를 추가하자 다음이 처음으로 보고됐습니다.

| 규칙 | 구 설정 | 전환 후 |
| --- | --- | --- |
| `no-case-declarations` | 0 | 12 |
| `no-empty` | 0 | 3 |
| `no-undef` | 0 | 1 |

또한 구 설정은 `settings['import/resolver']`만 선언하고 `plugins`에 `import`를 등록하지 않아, `import/no-cycle`을 참조하면서도 규칙이 로드되지 않고 있었습니다.

## 설정 구조

패키지 13개가 모두 동일한 보일러플레이트 `.eslintrc.js`를 갖고 있었고, 각자 `parserOptions.project`에 같은 상대 경로를 적고 있었습니다. flat config에서는 `projectService: true`가 각 파일에 맞는 tsconfig를 자동으로 찾으므로 이 중복이 전부 사라집니다.

`eslint.config.mjs`의 구성 순서는 다음과 같습니다.

1. 전역 무시 대상 (패키지별 `.eslintignore`를 통합)
2. `js.configs.recommended` + `tseslint.configs.recommended`
3. TypeScript 소스: 타입 인식 린팅 + 저장소 공통 규칙
4. RPC 경계 파일: `null` 허용 override
5. 테스트 코드: 제품 코드보다 완화
6. 설정·스크립트용 JavaScript: 타입 인식 대상 제외
7. Prettier 연동 (충돌 규칙을 끄므로 반드시 마지막)

### null 정책

내부 코드는 `undefined`로 통일하고, JSON-RPC 경계 파일에서만 `null`을 허용합니다. JSON에는 `undefined`가 없어 "값 없음"이 `null`로 오기 때문에, `null`은 SDK가 고르는 것이 아니라 전선에서 들어옵니다.

실측으로 확인한 성질이 하나 있습니다. **`unicorn/no-null`은 `null` 리터럴만 잡고 타입 위치는 잡지 않습니다.** 따라서 `topics?: (Topic | null)[]`처럼 전선 데이터의 모양을 타입으로 표현하는 것은 그대로 가능하고, 내부 코드가 `null` 값을 만드는 것만 막힙니다.

경계 파일 목록은 설정에 한 곳으로 모았습니다. 기존에는 `eslint-disable` 주석 16개가 소스 곳곳에 흩어져 있어 의도가 드러나지 않았습니다.

주의할 점은 이것이 **정책 선언일 뿐 구현이 아니라는 것**입니다. 지금도 `response_decoder.ts`는 전선에서 온 `null`을 그대로 통과시키고, `decodeHealth()`처럼 SDK가 직접 `null`을 만들어 내보내는 곳도 있습니다. 경계에서 `undefined`로 정규화하는 작업은 public API 타입이 바뀌므로 별도로 판단해야 합니다.

## 발견한 버그

### 1. `deploy.test.ts` 구문 오류 (수정함)

27행에서 연 `describe(` 블록이 닫히지 않은 채 파일이 끝나고 있었습니다. 파싱이 안 되므로 이 파일에는 **어떤 규칙도 적용된 적이 없었고**, `web3-contract` 테스트 수트가 수집 단계에서 실패하던 원인 중 하나였습니다.

### 2. 아무것도 억제하지 않던 `@ts-ignore` (수정함)

`encoding.ts`의 `@ts-ignore`를 `@ts-expect-error`로 바꾸자 TypeScript가 `TS2578: Unused '@ts-expect-error' directive`로 거부했습니다. 즉 원래 지시문은 억제할 오류가 없는 상태로 남아 있었습니다. `ban-ts-comment` 규칙이 경고하던 바로 그 상황이라 지시문을 제거했습니다.

### 3. `unsubscribe()`가 아무 일도 하지 않음 (수정하지 않음)

```ts
public async unsubscribe(condition?: ShouldUnsubscribeCondition) {
    const result: any[] = [];
    for (const [id, sub] of this.subscriptions.entries()) {
        if (!condition || (typeof condition === 'function' && condition({ id, sub }))) {
        }
    }
    return Promise.all(result);
}
```

`if` 본문이 비어 있어 `result`에 아무것도 담기지 않습니다. 같은 클래스의 `removeSubscription()`을 호출하지 않으므로 **어떤 구독도 해제되지 않고 항상 빈 배열이 반환됩니다.** JSDoc은 "조건을 만족하는 구독을 모두 해제하고 해제된 목록을 반환한다"고 설명합니다.

이 버그를 찾아낸 것은 정교한 분석이 아니라 `no-empty`, 즉 ESLint 기본 규칙 중 가장 단순한 "빈 블록 금지"였습니다. 이 저장소에서 한 번도 켜진 적이 없던 규칙입니다.

수정하면 런타임 동작이 바뀌므로 이번 작업에 포함하지 않았습니다. 남은 lint 2건이 이 함수입니다.

## 사고: 자동 수정에 의한 내용 삭제

`packages/web3-accounts/src/transfer_test.ts`의 내용 101줄이 `license-header` 규칙의 autofix로 삭제되는 일이 있었습니다.

이 파일은 라이선스 헤더를 포함해 **전체가 `//`로 주석 처리된 죽은 코드**였습니다. fixer는 파일 선두의 연속된 주석 덩어리를 "형식이 잘못된 헤더"로 인식하고 정상 헤더로 치환했는데, 파일 전체가 그 덩어리였기 때문에 내용이 전부 사라졌습니다.

`git checkout`으로 복구한 뒤 저장소 전체에서 같은 조건(전체가 주석)인 파일을 검사했고, 이 파일 하나뿐임을 확인해 무시 목록에 이유와 함께 등록했습니다.

이 파일을 삭제할지는 아직 결정하지 않았습니다. 내용이 전부 죽은 주석이라 유지할 근거가 약하지만, 삭제는 별도 판단이 필요합니다.

## 남긴 `any` 7건

전부 두 부류입니다.

- **컨트랙트 인자** (`contract.deploy`, `sendDeploy`): Solidity 타입이 제각각이라 ABI에서 타입을 추론해야 제대로 좁혀집니다.
- **구독 클래스 제네릭** (`web3_subscriptions.ts`, `web3_subscription_manager.ts`, `log_subscription.ts`): 구독 클래스마다 생성자 인자 형태가 달라 공통 시그니처로 묶이지 않습니다.

둘 다 브리핑 문서의 typed API 설계에 속하는 사안이라 lint 정리 작업에서 임의로 결정하지 않았습니다. 규칙을 끄지 않고 각 지점에 이유를 적은 인라인 예외를 남겨 부채가 보이도록 했습니다.

## 검토가 필요한 타입 변경

`Wallet.encrypt`/`decrypt`가 `any[]`를 쓰고 있었는데, 추상 기반 클래스 `Web3BaseWallet`은 이미 `KeyStore[]`로 선언하고 있었습니다. 구현체를 기반 클래스에 맞췄습니다.

해당 메서드들은 모두 `throw new Error('... not implemented')`이므로 정상 동작하는 호출자가 있을 수 없지만, **생성되는 `.d.ts`는 바뀝니다.**

## 검증 결과

| 검증 | Node 22.22.3 | Node 24.18.0 |
| --- | --- | --- |
| 전체 13개 패키지 빌드 | 성공 | 성공 |
| `yarn test` | 958개 통과 | 동일 |
| `npx eslint .` | 2건 (`unsubscribe()`) | 동일 |

테스트 실패 3개 패키지(`web3`, `web3-providers-ws`, `web3-contract`)는 이번 작업 전후가 동일하며, 원인도 기존과 같은 `.secrets.json` 및 외부 fixture 부재입니다.

lint 위반 추이는 다음과 같습니다.

```text
297  전환 직후
163  자동 수정 적용
 50  낡은 eslint-disable 주석 정리 (그중 35건은 불필요 판정되어 자동 제거)
 82  코드 수정
  2  남음 (unsubscribe)
```

## 남은 주의사항

- `license-header` 규칙의 autofix는 파일 선두의 주석 덩어리를 헤더로 간주해 치환합니다. 전체가 주석인 파일을 새로 추가할 때 같은 사고가 재발할 수 있습니다.
- ESLint 10은 Node `^22.13.0 || >=24`를 요구합니다. 저장소 `engines.node` 선언은 `>=22.0.0`이므로, Node 22.0~22.12 환경에서는 lint만 실행되지 않습니다. 개발 도구 의존성이라 SDK 소비자에게는 영향이 없습니다.
- `eslint-plugin-prettier`로 포맷을 lint 규칙으로 검사하는 현재 구성은 유지했습니다. Prettier 공식 문서는 성능상 별도 실행을 권장하므로, 이 구성을 계속 쓸지는 별도로 판단할 수 있습니다.

## 다음 작업

- `unsubscribe()` 수정 여부 결정 (런타임 동작 변경)
- `transfer_test.ts` 삭제 여부 결정
- `.secrets.json`을 요구하는 테스트를 unit과 integration으로 분리
- 테스트 전용 TypeScript typecheck 구성 검토
- 경계에서 `null`을 `undefined`로 정규화하는 구현 (public API 타입 영향 검토 필요)
