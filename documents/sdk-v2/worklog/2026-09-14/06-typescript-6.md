# TypeScript 6 업그레이드

> 이 문서는 BEATOZ SDK의 TypeScript를 `4.9.5`에서 `7.0.2`로 올렸다가 `6.0.3`으로 되돌린 과정과 근거, 설정 결정, 코드 수정 및 검증 결과를 기록합니다.

## 결론

- TypeScript 7.0.2를 먼저 시도했으나 생태계 지원 공백 때문에 `6.0.3`으로 확정했습니다.
- 루트와 13개 workspace의 TypeScript를 정확히 `6.0.3`으로 고정했습니다.
- Node 타입 정의는 최소 지원 런타임과 같은 주 버전인 `@types/node 22.20.2`로 맞췄습니다.
- `moduleResolution: "bundler"`, `rootDir`, `types: ["node"]` 설정은 TypeScript 7 검토 때 결정한 그대로 유지합니다.
- 전체 13개 패키지의 CJS, ESM 및 타입 선언 빌드가 Node 22와 Node 24에서 성공했습니다.
- Jest 실행은 TypeScript 7 검토 때 도입한 `babel-jest` 변환기를 그대로 유지합니다.
- `@typescript-eslint` 계열을 `5.30.7`에서 `8.70.0`으로 올려 lint 자체가 다시 실행되게 했습니다. 단, 기존 규칙 위반 정리는 이번 작업 범위가 아닙니다.

## TypeScript 7을 시도했다가 되돌린 이유

TypeScript 7은 컴파일러와 언어 서비스를 Go로 새로 포팅한 버전입니다. 공식 발표에 따르면 타입 체킹 로직 자체는 6.0과 구조적으로 동일하며, 바뀐 것은 실행 엔진의 속도입니다. 즉 7.0.2를 선택해도 6.0 대비 더 엄격한 타입 검사를 얻는 것은 아닙니다.

반면 7.0.2를 선택하면 다음 두 가지를 잃습니다.

- `@typescript-eslint`는 이 작업 시점 기준 `>=4.8.4 <6.1.0` 범위만 공식 지원합니다. TypeScript 7은 이 범위 밖이라 타입 인식 lint 규칙을 쓸 수 없습니다.
- `ts-jest`는 TypeScript 7의 컴파일러 API 변경(`readFile` 제거)으로 테스트 수집 전에 종료됩니다. 최신 `ts-jest 29.4.12`도 peer dependency가 `typescript >=4.3 <7`이라 공식 호환 상태를 만들 수 없습니다.

TypeScript 6.0.3은 두 조건을 모두 만족합니다. `@typescript-eslint` 지원 범위(`<6.1.0`) 안에 들어가고, `ts-jest`의 peer 범위(`<7`)에도 들어갑니다. 같은 타입 엄격도를 유지하면서 lint 안전망과 테스트 도구 호환성을 모두 되찾을 수 있으므로 6.0.3으로 확정했습니다.

`typescript` 패키지는 6.0.2까지만 공식 배포되고 6.0.3부터는 npm의 `typescript` 패키지 이름으로 직접 설치할 수 있습니다. Microsoft가 함께 배포하는 `@typescript/typescript6` alias 패키지는 6.0.2에서 멈춰 있어, 최신 패치를 받으려면 alias 대신 `typescript` 패키지를 직접 고정해야 합니다.

## 버전을 정확히 고정한 이유

기존 manifest는 `typescript: "^4.7.4"`를 선언했고 lockfile에는 `4.9.5`가 설치되어 있었습니다. 범위 선언과 실제 설치 버전이 달라 문제를 재현할 때 두 숫자를 함께 확인해야 했습니다.

컴파일러의 메이저 업그레이드는 모듈 해석과 표준 라이브러리 타입처럼 SDK 전체 출력에 영향을 줍니다. 모든 workspace에 정확한 버전 `6.0.3`을 선언해 로컬, CI 및 배포 빌드가 같은 컴파일러를 사용하도록 했습니다.

## TypeScript 설정 변경

이 절의 결정은 TypeScript 7을 검토하며 내렸지만, 7 전용 기능이 아니라 현대적인 Node 모듈 해석과 관련된 일반적인 변경이라 6.0.3에서도 그대로 유지합니다.

### 1. `moduleResolution: "node"` 제거

TypeScript 6.0에서는 과거의 Node.js 모듈 해석 방식인 `node`(`node10`)가 deprecated 상태이며, `"ignoreDeprecations": "6.0"`으로 유예하지 않으면 에러가 발생합니다. (TypeScript 7에서는 이 옵션이 완전히 제거되어 무조건 `TS5108`이 발생합니다.)

처음에는 현대 Node 규칙인 `node16`을 검토했지만, 현재 의존성 `long 5.2.3`의 CommonJS 타입 엔트리가 ESM 파일을 가져오면서 `TS1479`가 발생했습니다. 이 SDK는 패키지별로 CJS와 ESM을 동시에 생성하고 상대 import에 `.js` 확장자를 이미 사용하므로 다음 조합을 채택했습니다.

| 목적 | `module` | `moduleResolution` |
| --- | --- | --- |
| CommonJS 출력 | `commonjs` | `bundler` |
| ESM 출력 | `es2020` | `bundler` |
| 타입 선언 출력 | 기본값 `es2020` | `bundler` |

`bundler`는 package exports와 ESM 형식의 import를 현대적으로 해석하면서 실제 출력 형식을 강제하지 않습니다. 따라서 동일한 소스를 CJS와 ESM으로 각각 내보내는 현재 구조를 보존할 수 있습니다.

### 2. `rootDir` 명시

설정 파일 위치와 소스 위치가 다른 상속 구성에서 소스 루트를 추측하지 못하면 `TS5011`이 발생합니다. 공통 설정에 다음 값을 추가했습니다.

```json
"rootDir": "${configDir}/src"
```

`${configDir}`는 최종적으로 사용되는 각 workspace의 tsconfig 위치를 가리킵니다. 따라서 모든 패키지에서 자신의 `src` 디렉터리가 소스 루트가 됩니다.

### 3. Node 전역 타입 명시

공통 설정에 `types: ["node"]`를 추가하고 `@types/node`를 `22.20.2`로 올렸습니다. 이를 통해 `Error.captureStackTrace`, Node의 `net` 모듈과 같은 런타임 API가 어떤 workspace를 빌드하더라도 동일하게 노출됩니다.

`types`는 실행할 Node 버전을 바꾸는 설정이 아닙니다. TypeScript가 Node API의 이름, 매개변수 및 반환 타입을 검사할 때 사용하는 선언 파일을 선택하는 설정입니다.

## 컴파일러 업그레이드가 발견한 코드 문제

아래 두 문제는 TypeScript 7의 아키텍처가 아니라 `@types/node`와 `lib`를 올리면서 표준 라이브러리 타입이 더 정밀해진 결과입니다. 컴파일러를 6.0.3으로 되돌린 뒤에도 동일하게 재현되어 그대로 유지합니다.

### 콜백의 암묵적 `this`

`web3-utils`의 schema 탐색 코드는 `Array.find`의 `thisArg`와 일반 함수를 사용해 문자열을 비교했습니다. 콜백의 `this`가 암묵적 `any`가 되어 `TS2683`이 발생했습니다.

콜백 외부에 이미 있는 `previousDataPath`를 화살표 함수에서 직접 비교하도록 단순화했습니다. 실행 결과는 같지만 숨은 `this` 의존성이 없어졌습니다.

### TypedArray와 ArrayBuffer 구분

최신 표준 라이브러리는 TypedArray가 사용하는 buffer 종류를 더 정밀하게 추적합니다. 이 때문에 다음 두 문제가 드러났습니다.

- 사용자 정의 `BytesUint8Array` 생성자에 `ArrayBufferLike`를 바로 넘길 수 없음
- 최상위 Web3 타입은 `Uint8Array` 개인키를 허용하지만 실제 accounts 구현의 매개변수에는 빠져 있음

accounts 구현이 문자열, `ArrayBuffer`, `SharedArrayBuffer`, `Uint8Array`를 모두 받도록 계약을 일치시켰습니다. 입력은 표준 `Uint8Array`로 읽고 새 `BytesUint8Array`에 복사합니다. 개인키가 호출자 소유 buffer의 이후 변경에 영향을 받지 않는 효과도 있습니다.

이 동작은 단위 테스트로 고정했습니다.

## Jest 변환기

기존 `ts-jest 28.0.8`은 TypeScript 7을 로딩할 때 컴파일러 API의 `readFile`을 찾지 못해 테스트 수집 전에 종료되었습니다. 이 문제 때문에 Jest 실행과 제품 타입 검사의 역할을 분리했습니다.

| 도구 | 역할 |
| --- | --- |
| TypeScript `tsc` | SDK 소스의 타입 검사, CJS/ESM 생성, 타입 선언 생성 |
| `babel-jest` | Jest 실행을 위해 테스트와 소스의 TypeScript 문법 제거 및 CommonJS 변환 |

6.0.3에서는 `ts-jest`의 peer 범위(`typescript >=4.3 <7`)에 다시 들어가므로 `ts-jest`로 되돌리는 선택지도 있습니다. 이번 작업에서는 babel-jest 구성이 이미 검증되어 있고 타입 검사는 어차피 `yarn build`가 담당하므로 되돌리지 않고 유지했습니다. `ts-jest`로 되돌리면 테스트 파일 자체의 타입 오류까지 `yarn test`에서 잡을 수 있다는 장점이 있으므로, 필요하면 별도 작업으로 판단합니다.

Babel 변환 설정은 `scripts/jest/babel-transformer.js` 한 곳에 두고 13개 패키지의 Jest 설정이 함께 사용합니다.

## 빌드 신뢰성 수정

기존 각 workspace의 build script는 다음 세 작업을 `&`로 동시에 실행했습니다.

```sh
yarn build:cjs & yarn build:esm & yarn build:types
```

이 구조에서는 foreground 작업이 먼저 끝나면 Lerna가 성공으로 판단하는 동안 CJS 또는 ESM 출력이 아직 완성되지 않을 수 있었습니다. 세 출력이 모두 끝나야 패키지 빌드가 성공하도록 순차 실행으로 변경했습니다.

```sh
yarn build:cjs && yarn build:esm && yarn build:types
```

TypeScript의 `tsbuildinfo` 캐시는 각 패키지의 `lib/types` 아래에 저장합니다. `yarn clean`이 출력과 캐시를 함께 지우므로, 삭제된 산출물을 오래된 캐시가 가리는 문제를 막습니다.

## `@typescript-eslint` 업그레이드

기존 `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`는 `^5.30.7`이었습니다. 이 버전대는 TypeScript 7은 물론 최신 TypeScript 6.0.3도 공식 지원 범위 밖입니다.

`@typescript-eslint`의 현재 공식 지원 범위는 `>=4.8.4 <6.1.0`이며, 이 범위는 최신 major(8.x)를 기준으로 발표됩니다. 13개 workspace의 `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`를 `8.70.0`으로 올려 TypeScript 6.0.3을 공식 지원 범위 안에서 사용하도록 했습니다.

## 검증 결과

| 검증 | Node 22.22.3 | Node 24.18.0 |
| --- | --- | --- |
| `yarn install` | 성공 | 성공 |
| 전체 13개 패키지 빌드 | 성공 | 성공 |
| `tsc --version` | `Version 6.0.3` | `Version 6.0.3` |

`yarn test` 실행 결과, 10개 패키지에서 958개 테스트가 통과했습니다. 다음 3개 패키지는 TypeScript 버전과 무관하게 이전 기준선과 동일한 외부 테스트 환경 문제로 실패했습니다.

- `web3-contract`: `.secrets.json` 및 외부 fixture 필요
- `web3-providers-ws`: `.secrets.json`과 실행 중인 WebSocket endpoint 필요
- `web3`: `.secrets.json`과 실행 중인 endpoint 필요

이 실패는 Node 22와 Node 24 양쪽에서 동일하게 재현됩니다.

`yarn lint`는 더 이상 컴파일러 비호환으로 즉시 죽지 않고 끝까지 실행됩니다. 다만 13개 패키지 모두에서 규칙 위반으로 실패합니다. 확인된 원인 중 하나는 `.eslintrc`가 `@typescript-eslint/ban-types`처럼 `@typescript-eslint` 5.x에 있던 규칙 이름을 그대로 참조하는데, 8.x에서는 해당 규칙이 더 세분화된 규칙으로 나뉘면서 이름이 제거된 것입니다. 나머지는 prettier 포맷 위반 등 기존에 알려진 위반입니다. 이 정리는 이번 작업 범위가 아닙니다.

## 남은 주의사항

- Babel 기반 Jest는 테스트 코드의 타입 오류를 검사하지 않습니다. 테스트 전용 `tsc --noEmit` 구성을 추가하려면 현재 `src` 전용 `rootDir`과 테스트 전역 타입을 분리하는 후속 설계가 필요합니다.
- `.eslintrc`가 `@typescript-eslint` 5.x 기준 규칙 이름을 참조하고 있어 8.x로 올린 뒤에도 lint가 통과하지 않습니다. 규칙 이름 갱신과 기존 위반 정리가 함께 필요합니다.
- Lerna 6에서 출력되는 deprecated API와 listener 경고는 TypeScript 버전과 무관하며 Lerna 업그레이드 작업에서 다룹니다.

## 다음 작업

- `.secrets.json`을 요구하는 테스트를 unit과 integration으로 분리
- 테스트 전용 TypeScript typecheck 구성 검토
- `.eslintrc`의 `@typescript-eslint` 8.x 규칙 이름 갱신, 이후 기존 lint 위반을 포맷 위반과 코드 품질 위반으로 분류
- `ts-jest`로 되돌릴지 여부 결정 (테스트 파일 타입 검사 이득 vs 이미 검증된 babel-jest 유지)
