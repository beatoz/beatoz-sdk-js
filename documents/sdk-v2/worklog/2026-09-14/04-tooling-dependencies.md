# 개발 도구 의존성 정리

이 문서는 TypeScript 업그레이드 전에 남아 있던 Cypress와 Prettier 관련 의존성 경고를 어떻게 분석하고 정리했는지 기록합니다.

## 결론

- 사용되지 않는 Cypress 관련 패키지를 제거했습니다.
- 저장소 전체의 Prettier 주 버전을 3으로 통일했습니다.
- 당시 Node 16.19 지원 선언과 호환되도록 `prettier-plugin-solidity 1.4.1`을 고정했습니다.
- 의존성 설치와 전체 13개 패키지 빌드가 성공합니다.
- 전체 lint는 도구 로딩 문제가 아니라 기존 소스의 lint 및 포맷 위반 때문에 실패합니다. 소스 자동 수정은 별도 작업으로 분리합니다.
- 전체 의존성의 Node engine 감사에서 당시 선언된 Node 16.19 지원 범위와 충돌하는 패키지 4개를 추가로 발견했습니다. 이 발견은 후속 Node 22/24 지원 정책의 근거가 됐습니다.

## peer dependency란 무엇인가

일반 dependency는 패키지가 직접 설치해서 사용하는 의존성입니다. peer dependency는 플러그인이 함께 동작할 도구를 사용하는 프로젝트가 직접 제공해야 한다는 호환 계약입니다.

예를 들어 `eslint-plugin-prettier 5`는 Prettier `>=3`을 peer dependency로 요구합니다. 플러그인만 설치되어 있고 실제 Prettier가 2라면 설치는 될 수 있어도 지원되지 않는 조합입니다.

## Cypress 관련 문제

### 확인된 상태

`@cypress/webpack-preprocessor 5.17.1`은 다음 peer dependency를 요구했습니다.

```text
@babel/core: ^7.0.1
@babel/preset-env: ^7.0.0
babel-loader: ^8.0.2 || ^9
webpack: ^4 || ^5
```

저장소에는 `babel-loader`가 없어서 Yarn 설치 경고가 발생했습니다. 그러나 전체 저장소를 검색한 결과 다음 사실도 확인했습니다.

- Cypress 설정 파일이 없음
- Cypress 테스트가 없음
- `@cypress/webpack-preprocessor`를 불러오는 코드가 없음
- Cypress 실행 패키지 자체도 없음
- `cypress-jest-adapter`도 선언만 되어 있고 사용처가 없음

### 결정

사용되지 않는 전처리기를 위해 `babel-loader`를 새로 추가하지 않고 다음 항목을 제거했습니다.

- 루트의 `@cypress/webpack-preprocessor`
- `@beatoz/web3-validator`의 `@cypress/webpack-preprocessor`
- `@beatoz/web3`의 `@cypress/webpack-preprocessor`
- 루트의 `cypress-jest-adapter`

이 결정은 경고를 숨기는 것이 아니라 필요하지 않은 의존성과 그 전이 의존성을 제거해 manifest가 실제 코드 사용 상태를 표현하도록 만든 것입니다.

## Prettier 관련 문제

### 확인된 상태

- 루트는 `prettier ^2.7.1`을 선언함
- 11개 workspace는 `prettier ^3.0.0`을 선언함
- 모든 workspace가 사용하는 `eslint-plugin-prettier ^5.0.0`은 Prettier `>=3.0.0`을 요구함
- Prettier를 직접 선언하지 않은 workspace는 Yarn hoisting에 의해 루트의 Prettier 2를 사용함

따라서 하나의 저장소 안에서 Prettier 2와 3이 동시에 설치되고, 일부 패키지는 peer dependency 조건을 만족하지 못했습니다.

### 결정

루트 선언을 `prettier ^3.0.0`으로 변경했습니다. 갱신된 lockfile에서는 전체 workspace가 hoisting된 `prettier 3.9.6` 하나를 공유합니다.

Prettier 3 전환은 포맷 결과에 영향을 줄 수 있습니다. 이번 작업에서는 의존성 호환만 정리하고 기존 소스를 일괄 포맷하지 않았습니다. `yarn lint`에서 확인된 기존 포맷 위반은 별도의 포맷 기준선 작업에서 검토해야 합니다.

## Node 지원 범위와 Solidity 플러그인

루트의 기존 선언은 다음과 같았습니다.

```json
"prettier-plugin-solidity": "^1.0.0-beta.20"
```

이 범위는 현재 `1.4.3`을 선택합니다. 하지만 `1.4.3`은 Node `>=18`을 요구하고, 이 저장소는 Node `>=16.19.0` 지원을 선언합니다.

`prettier-plugin-solidity 1.4.1`은 다음 조건을 만족합니다.

- Node `>=16`
- Prettier `>=2.3.0`

따라서 이 의존성 정리 단계에서는 `1.4.1`을 정확한 버전으로 고정했습니다. 후속 작업에서 최소 Node 버전을 22로 올렸지만, Node 전환과 포맷 결과 변경을 섞지 않기 위해 Solidity 플러그인의 major 업그레이드는 별도 작업으로 남깁니다.

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| `yarn install` | 성공, 기존 Cypress/Prettier peer 경고 없음 |
| `yarn install --frozen-lockfile` | 성공 |
| `yarn check --verify-tree` | 성공 |
| `yarn why prettier` | workspace 전체가 `3.9.6` 하나를 공유 |
| `yarn build` | 전체 13개 패키지 성공 |
| `yarn lint` | 기존 소스의 lint/포맷 위반으로 11개 패키지 실패 |

설치 중 출력되는 다른 운영체제와 CPU용 optional dependency 제외 메시지는 현재 macOS ARM 환경에 맞지 않는 바이너리를 건너뛰었다는 정보이며, peer dependency 오류가 아닙니다.

## 추가 발견: 최소 Node 버전 불일치

당시 저장소의 모든 패키지는 Node `>=16.19.0`을 지원한다고 선언했습니다. 설치된 모든 패키지의 `engines.node`를 Node `16.19.0`과 비교한 결과 다음 네 개가 호환되지 않았습니다.

| 패키지 | 요구 버전 | 유입 경로 | 성격 |
| --- | --- | --- | --- |
| `secp256k1 4.0.5` | Node `>=18` | `@beatoz/web3-accounts` | 런타임 |
| `@ethereumjs/rlp 5.0.2` | Node `>=18` | `web3-eth-contract` | 런타임 |
| `@inquirer/external-editor 1.0.3` | Node `>=18` | Lerna의 `inquirer` | 개발 도구 |
| `node-releases 2.0.55` | Node `>=18` | Browserslist | 개발 도구 |

또한 TypeScript `7.0.2`의 공식 npm metadata는 Node `>=16.20.0`을 요구하므로 현재 선언된 `16.19.0`에서는 다음 TypeScript 업그레이드 자체도 지원 범위를 벗어납니다.

가능한 방향은 다음 두 가지입니다.

1. 최소 Node 버전을 현재 지원되는 LTS 계열로 올리고 의존성도 그 기준에서 현대화합니다.
2. Node 16 지원을 유지하기 위해 런타임 및 개발 도구의 전이 의존성을 과거 호환 버전으로 고정합니다.

두 번째 방향은 이미 지원이 종료된 Node 16을 위해 여러 간접 의존성을 계속 고정해야 하고 TypeScript 7 작업도 제약하므로 채택하지 않았습니다. 후속 결정과 변경 내용은 [Node.js 지원 기준 현대화](./05-node-runtime.md)에 기록했습니다.

## 남은 작업

- 기존 lint 오류의 기준선을 기록하고 포맷 변경과 코드 품질 오류를 분리
- `.secrets.json`이 필요한 테스트를 integration/e2e로 분리
- 테스트 기준선 복구 후 TypeScript 업그레이드 시작
