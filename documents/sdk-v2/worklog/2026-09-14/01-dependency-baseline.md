# TypeScript 4.9 의존성 기준선 복구

> 이 문서는 TypeScript 업그레이드 전에 기존 SDK 빌드를 막던 의존성 충돌의 원인, 해결 방법, 검증 결과를 기록합니다.

## 결론

TypeScript `4.9.5`에서 발생하던 `@types/glob`/`minimatch` 및 Webpack 타입 충돌을 해결했습니다.

- `@types/minimatch`를 `3.0.5`로 고정했습니다.
- Webpack을 TypeScript 4.9와 호환되는 `5.99.9`로 고정했습니다.
- Webpack 5가 자체 타입을 제공하므로 중복된 `@types/webpack`을 제거했습니다.
- `yarn.lock`을 Git에서 관리하도록 변경했습니다.
- 전체 13개 패키지 빌드와 타입 선언 빌드가 성공합니다.

테스트 전체 실행은 아직 실패하지만, 남은 실패는 이번 의존성 충돌과 다른 테스트 설정 및 로컬 비밀 파일 문제입니다.

## 기존 문제 1: glob과 minimatch 타입 세대 불일치

문제가 발생한 의존성 경로는 다음과 같습니다.

```text
clean-webpack-plugin 4.0.0
└── del 4.1.1
    └── @types/glob 7.2.0
        └── @types/minimatch 6.0.0
            └── minimatch 10.2.6
```

`@types/glob 7.2.0`은 과거 minimatch 타입인 `IOptions`와 `IMinimatch`를 참조합니다. 그러나 `@types/minimatch 6.0.0`은 실제 타입을 포함하지 않고 최신 minimatch를 `*` 범위로 가져오는 패키지이며, 선택된 `minimatch 10.2.6`에는 과거 타입 이름이 없습니다.

대표 오류는 다음과 같습니다.

```text
@types/glob/index.d.ts: Namespace 'minimatch' has no exported member 'IOptions'.
@types/glob/index.d.ts: Namespace 'minimatch' has no exported member 'IMinimatch'.
```

루트 `package.json`의 Yarn `resolutions`를 사용해 모든 workspace가 호환되는 타입 정의를 사용하도록 고정했습니다.

```json
{
  "resolutions": {
    "@types/minimatch": "3.0.5"
  }
}
```

## 기존 문제 2: Webpack 타입과 TypeScript 4.9의 불일치

기존 선언은 `webpack: ^5.73.0`이었습니다. 이 범위는 모든 Webpack 5.x를 허용하므로 설치 당시 `5.110.3`이 선택되었습니다.

Webpack `5.110.3`의 타입 선언은 `Symbol.dispose`를 사용하지만 TypeScript `4.9.5`는 해당 타입을 알지 못합니다.

```text
Property 'dispose' does not exist on type 'SymbolConstructor'.
```

처음에는 Webpack `5.73.0`을 확인했지만, 이 버전은 현재 `@types/node 18.11.9`와 `WebpackError.prepareStackTrace`의 선택적 속성 정의가 충돌했습니다.

```text
Class static side 'typeof WebpackError' incorrectly extends base class static side ...
Type 'undefined' is not assignable to type ...
```

공식 배포 패키지의 `types.d.ts`를 비교한 결과는 다음과 같습니다.

| Webpack 버전 | `prepareStackTrace` 충돌 | `Symbol.dispose` 사용 |
| --- | --- | --- |
| `5.73.0` | 발생 | 없음 |
| `5.74.0` ~ `5.98.0` | 발생 | 없음 |
| `5.99.9` | 없음 | 없음 |
| `5.100.0` | 없음 | 있음 |
| `5.110.3` | 없음 | 있음 |

따라서 현재 TypeScript 4.9 기준선에서는 두 조건을 모두 만족하는 Webpack `5.99.9`를 정확히 고정했습니다.

```json
{
  "devDependencies": {
    "webpack": "5.99.9"
  }
}
```

Webpack 5는 자체 타입 선언을 포함합니다. 별도 `@types/webpack`은 다시 Webpack `^5`를 간접 설치해 서로 다른 Webpack 버전이 동시에 존재하게 했으므로 루트, `web3`, `web3-validator`에서 제거했습니다.

## lockfile 관리

기존 `.gitignore`는 `yarn.lock`을 무시했습니다. 이 상태에서는 같은 `package.json`과 같은 Git 커밋에서도 설치 시점에 따라 다른 하위 의존성이 선택될 수 있습니다.

`yarn.lock`을 Git 관리 대상으로 바꾸고 새 의존성 조합을 기록했습니다. 이후 CI에서는 다음 명령으로 lockfile과 다른 설치를 차단할 수 있습니다.

```bash
yarn install --frozen-lockfile
```

## 검증 결과

검증 환경:

```text
Node.js    v22.22.3
Yarn       1.22.15
TypeScript 4.9.5
Webpack    5.99.9
```

실행 결과:

| 명령 | 결과 |
| --- | --- |
| `yarn install --frozen-lockfile` | 성공 |
| `yarn workspace @beatoz/web3-types build` | 성공 |
| `yarn build` | 성공, 13개 패키지 전체 빌드 |
| `yarn build:types` | 성공, 13개 패키지 타입 선언 생성 |
| `yarn test:silent` | 실패, 의존성 충돌 외의 테스트 환경 문제 존재 |

## 남은 테스트 문제

전체 테스트에서 실패한 패키지는 다음 네 개입니다.

- `@beatoz/web3-contract`
- `@beatoz/web3-accounts`
- `@beatoz/web3-providers-ws`
- `@beatoz/web3`

확인된 원인은 두 종류입니다.

1. `web3-contract`와 `web3-accounts`의 ts-jest 설정이 `./packages/web3-contract/test/tsconfig.json`을 package 디렉터리 기준으로 다시 해석해 존재하지 않는 경로를 찾습니다.
2. WebSocket/RPC 성격의 테스트가 저장소 루트의 `.secrets.json`을 요구하지만 현재 파일이 없습니다.

이 문제는 의존성 충돌과 분리해 테스트 구조 정리 단계에서 해결합니다. 비밀 파일을 임의로 생성하거나 테스트를 무조건 제외하지 않고, unit/integration 테스트 경계를 먼저 결정해야 합니다.

## 후속 작업에서 해결한 설치 경고

기준선 복구 직후에는 빌드 실패와 직접 관련 없는 peer dependency 경고가 남아 있었습니다.

- `@cypress/webpack-preprocessor`가 `babel-loader`를 요구하지만 선언되어 있지 않음
- 일부 workspace의 `eslint-plugin-prettier 5`가 Prettier 3을 요구하지만 루트에는 Prettier 2가 선언되어 있음

후속 조사 결과 Cypress 관련 패키지는 사용되지 않아 제거했고, Prettier는 3으로 통일했습니다. 자세한 판단 근거와 검증 결과는 [개발 도구 의존성 정리](./04-tooling-dependencies.md)에 기록했습니다.

## 다음 작업

1. Jest의 tsconfig 경로를 package별 상대경로로 바로잡습니다.
2. `.secrets.json`이 필요한 테스트를 unit과 integration/e2e 중 어디에 둘지 정합니다.
3. 전체 테스트 기준선을 정상화합니다.
4. 기존 lint 오류의 기준선을 정리합니다.
5. 기준선 커밋 이후 TypeScript 업그레이드를 시작합니다.
