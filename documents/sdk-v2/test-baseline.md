# 테스트 기준선 복구

> 이 문서는 TypeScript 업그레이드 전에 기존 Jest 테스트의 실행 환경을 복구하면서 확인한 문제와 검증 결과를 기록합니다.

상태: 진행 중

## 첫 번째 문제: ts-jest의 잘못된 tsconfig 경로

`web3-contract`와 `web3-accounts`의 공통 Jest 설정은 다음 경로를 하드코딩하고 있었습니다.

```text
./packages/web3-contract/test/tsconfig.json
```

Lerna가 각 workspace 디렉터리에서 Jest를 실행하면 ts-jest는 이 값을 현재 package 디렉터리를 기준으로 해석합니다. 그 결과 `web3-contract`에서는 다음과 같이 중복된 경로가 만들어졌습니다.

```text
packages/web3-contract/packages/web3-contract/test/tsconfig.json
```

`web3-accounts`도 자신의 설정이 아니라 `web3-contract`의 설정을 복사해 참조하고 있었습니다.

## 수정 방법

Jest를 어느 디렉터리에서 실행하더라도 같은 파일을 찾도록 설정 파일 자체의 위치인 `__dirname`을 기준으로 절대경로를 생성했습니다.

```js
const path = require('path');

module.exports = {
    globals: {
        'ts-jest': {
            tsconfig: path.resolve(__dirname, '../tsconfig.json'),
        },
    },
};
```

각 package는 이제 자신의 `test/tsconfig.json`을 사용합니다.

## 검증 결과

### web3-accounts

```bash
yarn workspace @beatoz/web3-accounts test:silent
```

결과:

```text
Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
```

### 전체 테스트

```bash
yarn test:silent
```

기존에는 4개 package가 실패했지만 경로 수정 후 `web3-accounts`가 통과하여 실패 package가 3개로 줄었습니다.

- `@beatoz/web3-contract`
- `@beatoz/web3-providers-ws`
- `@beatoz/web3`

## 경로 문제 뒤에 가려져 있던 문제

`web3-contract`는 올바른 tsconfig로 컴파일되기 시작하면서 다음 기존 문제를 드러냈습니다.

- 저장소 루트의 `.providers.json` 부재
- 저장소 루트의 `.secrets.json` 부재
- 생성 결과로 보이는 `test/fixtures/deployed.contract.json` 부재
- 일부 테스트에서 `@beatoz/web3` 모듈 해석 실패
- `deploy.test.ts`의 닫히지 않은 코드 블록
- 일부 callback 매개변수의 암시적 `any`

`web3-providers-ws`와 `web3`의 실패 테스트는 실제 WebSocket RPC 서버에 연결하므로 순수 unit test가 아니라 integration/e2e 성격입니다.

## 다음 결정

테스트를 통과시키기 위해 비밀 파일을 임의로 만들거나 실패 테스트를 단순 제외하지 않습니다. 다음 단계에서 테스트를 두 계층으로 분리합니다.

1. 외부 서버 없이 항상 실행할 수 있는 unit test
2. RPC 주소와 계정 정보가 있을 때 실행하는 integration/e2e test

분리 후 다음 조건을 만족해야 합니다.

- `yarn test:silent`는 비밀 파일 없이 unit test만 실행
- integration/e2e test는 별도 명령으로 명시적으로 실행
- 필요한 설정의 예제 파일과 실행 방법 제공
- CI에서 unit test는 항상 실행
- integration/e2e test는 비밀값이 구성된 환경에서만 실행
