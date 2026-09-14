# 2026-09-14 작업 요약

상태: 의존성 기준선, Node 22/24 지원, TypeScript 6 업그레이드 및 lint 도구 현대화 완료

> 오늘은 SDK의 의존성 충돌을 해결하고 Node 지원 기준을 현대화한 뒤 TypeScript 업그레이드를 진행했습니다. TypeScript 7.0.2를 먼저 시도했지만 `@typescript-eslint`와 `ts-jest`의 공식 지원 범위 밖이라 `6.0.3`으로 확정했습니다. 이어서 수명이 끝난 ESLint 8을 10으로 올리고 flat config로 이전해, 그동안 쌓여 있던 lint 위반 297건을 2건까지 줄이면서 실제 버그 3건을 발견했습니다. Node 22와 24에서 CJS, ESM 및 타입 선언 출력을 검증했습니다.

## 오늘의 결론

TypeScript `4.9.5` 기준에서 Webpack 및 minimatch 타입 충돌을 해결한 뒤 TypeScript 7.0.2로 올렸다가, `@typescript-eslint`(공식 지원 `<6.1.0`)와 `ts-jest`(peer `typescript <7`) 지원 범위 밖이라는 사실을 확인하고 `6.0.3`으로 되돌렸습니다. TypeScript 7의 타입 체킹 로직 자체가 6.0과 동일하므로 엄격도 손실 없이 도구 호환성을 회복했습니다. `ts-jest`는 여전히 TypeScript 7과 호환되지 않아 도입했던 Babel 기반 Jest 변환기를 그대로 유지했고, Node 22와 24에서 전체 빌드가 성공했습니다.

lint는 도구 자체가 수명이 끝난 상태였습니다. ESLint 8.57.1에 `.eslintrc.js` 형식을 쓰고 있었는데, ESLint 10(2026-02)에서 eslintrc 방식이 완전히 제거되어 설정을 다시 쓰지 않으면 올릴 수 없는 구조였습니다. ESLint 10과 flat config로 이전하고 방치된 플러그인 3개를 교체했습니다. 이 과정에서 구 설정이 `eslint:recommended`를 아예 켠 적이 없다는 사실이 드러났고, 처음 돌기 시작한 기본 규칙들이 실제 버그 3건을 잡아냈습니다. 전체 테스트에는 `.secrets.json`과 외부 endpoint가 필요한 기존 integration 환경 문제가 남아 있습니다.

## 해결하려던 문제

TypeScript 버전을 올리기 전에 현재 SDK의 빌드 기준선을 확인했습니다.

## 확인한 사실과 근거

- TypeScript는 현재 `4.9.5`가 설치됨
- 기존 `yarn build`와 `yarn build:types`는 `@types/glob`/`minimatch`, Webpack 타입 충돌로 실패
- `yarn.lock`은 저장소에서 무시되고 있어 설치 시 의존성 버전이 재현되지 않음
- `@types/minimatch 3.0.5`와 Webpack `5.99.9` 조합에서 전체 빌드 및 타입 선언 빌드 성공
- 불필요한 `@types/webpack` 제거
- `yarn install --frozen-lockfile` 성공
- `yarn test:silent`는 4개 패키지에서 테스트 설정 및 `.secrets.json` 문제로 실패
- `web3-contract`와 `web3-accounts`의 ts-jest 경로를 설정 파일 위치 기준의 절대경로로 수정
- `web3-accounts` 테스트 2개 suite, 3개 test 전체 성공
- 전체 테스트의 실패 package가 4개에서 3개로 감소
- 의존성 설치와 내부 패키지 연결은 Yarn workspaces가 담당하고, Lerna는 여러 패키지의 작업 실행을 담당함
- `lerna bootstrap`을 제거한 뒤 `yarn install --frozen-lockfile`과 전체 13개 패키지 빌드 성공
- 사용되지 않는 Cypress 전처리기와 Jest 어댑터 제거
- Prettier를 3으로 통일하고 Node 16 호환을 위해 `prettier-plugin-solidity 1.4.1` 고정
- `yarn lint`는 실행되지만 기존 소스 위반으로 11개 패키지에서 실패
- 전체 engine 감사에서 Node 16.19와 호환되지 않는 의존성 4개 발견
- TypeScript 7.0.2도 Node 16.20 이상을 요구하므로 현재 Node 16.19 선언과 불일치
- SDK 최소 지원 버전을 Node 22로, 개발 기본 버전을 Node 24로 결정
- 루트와 13개 workspace의 `engines.node`를 `>=22.0.0`으로 통일하고 `.nvmrc` 추가
- Node 22.22.3과 24.21.0에서 frozen install, 의존성 트리 검사 및 전체 13개 패키지 빌드 성공
- 두 Node 버전에서 `web3-accounts` 단위 테스트 2 suites, 3 tests 성공
- 설치된 의존성 중 최소 Node 22와 engine이 충돌하는 패키지는 0개
- 루트와 13개 workspace의 TypeScript를 먼저 `7.0.2`로 정확히 고정
- TypeScript 7에 맞춰 `moduleResolution: "bundler"`, 명시적 `rootDir` 및 Node 전역 타입 적용
- TypedArray 타입 정밀화로 발견된 accounts 개인키 입력 계약을 수정하고 회귀 테스트 추가
- TypeScript 7과 호환되지 않는 `ts-jest 28`을 제거하고 공통 `babel-jest` 변환기 적용
- workspace 빌드의 백그라운드 실행 경쟁을 제거하고 CJS, ESM, 타입 선언을 순차 생성
- `@typescript-eslint` 공식 지원 범위가 `>=4.8.4 <6.1.0`임을 확인, TypeScript 7은 이 범위 밖
- `ts-jest 29.4.12`도 peer dependency가 `typescript >=4.3 <7`이라 TypeScript 7과 공식 호환 불가
- TypeScript 7의 타입 체킹 로직은 6.0과 구조적으로 동일함을 공식 발표로 확인 (엔진 속도만 차이)
- `typescript` 패키지는 `6.0.3`까지 정식 배포됨을 npm 레지스트리에서 확인, Microsoft의 `@typescript/typescript6` alias는 `6.0.2`에서 멈춰 있음
- 루트와 13개 workspace의 TypeScript를 `6.0.3`으로 재고정, 루트에 남아있던 미사용 `@typescript/native` alias 제거
- Node 22.22.3과 24.18.0에서 전체 13개 패키지 빌드 및 CJS/ESM 로딩 성공 (TypeScript 6.0.3 기준)
- 전체 테스트에서 10개 패키지, 958개 테스트 성공; 나머지 3개는 기존 `.secrets.json` 환경 문제 (Node 22/24 동일)
- `@typescript-eslint`를 `5.30.7`에서 `8.70.0`으로 올려 lint가 컴파일러 비호환 없이 끝까지 실행됨을 확인
- `yarn lint`는 여전히 13개 패키지 전부 실패; 원인 중 하나는 `.eslintrc`가 5.x 규칙 이름(`@typescript-eslint/ban-types`)을 참조해 8.x에서 규칙을 찾지 못함
- ESLint 9는 2026-08-06 지원 종료, ESLint 10(2026-02)은 eslintrc 설정 방식을 완전히 제거 — `.eslintrc.js`는 상위에 더 이상 존재하지 않는 형식
- `eslint-plugin-header`와 `eslint-plugin-no-null`은 2022-06-17 이후 발행 이력 없음, `eslint-plugin-import`는 peer를 ESLint 9까지만 선언
- lint 출력 1001줄의 구성: prettier 포맷 515, 규칙명 없음 28, Parsing error 13, 나머지가 실제 코드 위반
- 실제 코드 위반은 이전에도 보고되고 있었음(`no-unused-vars` 70, `no-explicit-any` 40) — 보이지 않았던 것이 아니라 포맷 노이즈에 덮여 방치돼 있던 것
- 구 설정의 `extends`에 `eslint:recommended`가 없어 ESLint 본체 기본 규칙이 한 번도 실행된 적 없음; 추가하자 `no-case-declarations` 12, `no-empty` 3, `no-undef` 1이 처음 보고됨
- 구 설정은 `settings['import/resolver']`만 두고 `plugins`에 `import`를 등록하지 않아 `import/no-cycle`이 로드조차 되지 않았음
- `unicorn/no-null`은 `null` 리터럴만 잡고 타입 위치는 잡지 않음을 실측 확인 — 전선 데이터를 `| null`로 타이핑하는 것은 그대로 가능
- `deploy.test.ts`의 `describe` 블록이 닫히지 않아 파싱 불가 상태였고, 그 결과 이 파일에는 어떤 규칙도 적용된 적이 없었음
- `encoding.ts`의 `@ts-ignore`는 억제할 오류가 없는 상태였음(`@ts-expect-error` 전환 시 `TS2578`로 드러남)
- `Web3SubscriptionManager.unsubscribe()`의 `if` 본문이 비어 있어 구독이 전혀 해제되지 않고 항상 빈 배열을 반환함 — `no-empty` 규칙이 발견
- `license-header` autofix가 전체가 주석인 파일(`transfer_test.ts`)의 내용 101줄을 삭제하는 사고 발생, 복구 후 저장소 전체 검사로 동일 조건 파일이 이 하나뿐임을 확인
- lint 위반 297건 → 2건, 패키지별 중복 lint 의존성 91개를 루트로 통합

## 결정한 사항

- `yarn.lock`을 Git에서 관리
- TypeScript 4.9 기준 Webpack을 `5.99.9`로 정확히 고정
- `@types/minimatch`를 Yarn `resolutions`로 `3.0.5`에 고정
- 테스트 환경 문제는 의존성 빌드 충돌과 분리해 해결
- 테스트 설정 경로는 실행 디렉터리가 아니라 Jest 설정 파일의 `__dirname`을 기준으로 계산
- Lerna 자체는 유지하고, Yarn workspaces와 역할이 중복되는 레거시 `lerna bootstrap`만 제거
- 의존성 설치와 빌드를 각각 `yarn install`과 `yarn build`로 명시적으로 분리
- 사용되지 않는 도구의 누락된 peer dependency를 추가하지 않고 도구 자체를 제거
- 포맷 의존성 통일과 기존 소스의 일괄 포맷은 별도 작업으로 분리
- SDK 최소 지원 버전은 Node 22로 정하고 모든 workspace에 일괄 반영
- Node 22와 24를 지원하고, 향후 CI에서 두 버전을 함께 검증
- CJS와 ESM 출력은 유지하고 모듈 해석만 `bundler` 방식으로 현대화 (TypeScript 7 전용 기능이 아니므로 6.0.3에서도 유지)
- 테스트 실행 변환과 제품 타입 검사를 분리해 Babel은 Jest 실행, `tsc`는 타입 안전성을 담당
- 패키지 빌드는 병렬 background 작업이 아니라 성공 여부가 보장되는 순차 작업으로 실행
- TypeScript는 `7.0.2`가 아니라 `6.0.3`을 최종 버전으로 확정 (같은 타입 엄격도, `@typescript-eslint`/`ts-jest` 공식 지원 범위 안)
- `ts-jest`로 되돌리지 않고 이미 검증된 `babel-jest` 변환기를 유지 (되돌리는 선택지는 별도 작업으로 분리)
- lint는 ESLint 8에 머무르며 깨진 것만 고치는 대신, ESLint 10 + flat config로 근본 이전 (구 형식이 상위에서 제거되어 어차피 갇힌 구조였음)
- 방치된 플러그인은 유지하지 않고 교체: `header` → `license-header`, `no-null` → `unicorn`, `import` → `import-x`
- 13개 패키지의 중복 eslintrc를 없애고 `projectService: true`로 tsconfig 자동 탐색 사용
- null 정책은 설정으로 표현: 내부 코드는 `unicorn/no-null`, RPC 경계 파일만 override로 허용 (실제 정규화 구현은 별도 작업)
- `any` 7건은 규칙을 끄지 않고 이유를 적은 인라인 예외로 남겨 부채를 노출 (ABI 타입 추론·구독 제네릭은 typed API 작업 소관)
- 포맷 일괄 적용·도구 이전·코드 수정을 세 커밋으로 분리 (`975e212`, `1349e41`, `75e0711`)
- `unsubscribe()` 수정은 런타임 동작이 바뀌므로 이번 작업에 포함하지 않음

## 다음 작업

- `Web3SubscriptionManager.unsubscribe()` 수정 여부 결정 (런타임 동작 변경, 남은 lint 2건)
- `transfer_test.ts` 삭제 여부 결정 (전체가 주석 처리된 죽은 코드)
- `.secrets.json`이 필요한 테스트의 unit/integration 경계 결정
- `web3-contract`의 외부 fixture 및 모듈 해석 정리
- 테스트 전용 TypeScript typecheck 구성 검토
- 경계에서 `null`을 `undefined`로 정규화하는 구현 (public API 타입 영향 검토 필요)
- `ts-jest`로 되돌릴지 여부 결정 (테스트 파일 타입 검사 이득 vs 이미 검증된 babel-jest 유지)
- SDK 버전 ↔ Node ↔ TypeScript 지원 범위를 정리한 문서 작성 (undici의 LTS 표 형식 참고)

## 관련 문서

- [TypeScript 4.9 의존성 기준선 복구](./01-dependency-baseline.md)
- [테스트 기준선 복구](./02-test-baseline.md)
- [Yarn workspaces와 Lerna 역할 정리](./03-lerna-workspaces.md)
- [개발 도구 의존성 정리](./04-tooling-dependencies.md)
- [Node.js 지원 기준 현대화](./05-node-runtime.md)
- [TypeScript 6 업그레이드](./06-typescript-6.md)
- [Lint 도구 현대화](./07-lint-toolchain.md)
