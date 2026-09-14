# 2026-09-14 작업 요약

상태: 의존성 기준선, Node 22/24 지원 및 TypeScript 6 업그레이드 완료

> 오늘은 SDK의 의존성 충돌을 해결하고 Node 지원 기준을 현대화한 뒤 TypeScript 업그레이드를 진행했습니다. TypeScript 7.0.2를 먼저 시도했지만 `@typescript-eslint`와 `ts-jest`의 공식 지원 범위 밖이라 `6.0.3`으로 확정했습니다. Node 22와 24에서 CJS, ESM 및 타입 선언 출력을 검증했습니다.

## 오늘의 결론

TypeScript `4.9.5` 기준에서 Webpack 및 minimatch 타입 충돌을 해결한 뒤 TypeScript 7.0.2로 올렸다가, `@typescript-eslint`(공식 지원 `<6.1.0`)와 `ts-jest`(peer `typescript <7`) 지원 범위 밖이라는 사실을 확인하고 `6.0.3`으로 되돌렸습니다. TypeScript 7의 타입 체킹 로직 자체가 6.0과 동일하므로 엄격도 손실 없이 도구 호환성을 회복했습니다. `ts-jest`는 여전히 TypeScript 7과 호환되지 않아 도입했던 Babel 기반 Jest 변환기를 그대로 유지했고, Node 22와 24에서 전체 빌드가 성공했습니다. `@typescript-eslint`를 `8.70.0`으로 올려 lint가 다시 실행되지만, `.eslintrc`가 구버전 규칙 이름을 참조해 여전히 실패합니다. 전체 테스트에는 `.secrets.json`과 외부 endpoint가 필요한 기존 integration 환경 문제가 남아 있습니다.

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

## 다음 작업

- `.secrets.json`이 필요한 테스트의 unit/integration 경계 결정
- `web3-contract`의 외부 fixture, 모듈 해석 및 기존 테스트 코드 오류 정리
- `.eslintrc`의 `@typescript-eslint` 8.x 규칙 이름 갱신, 이후 기존 lint 위반을 포맷 위반과 코드 품질 위반으로 분류
- 테스트 전용 TypeScript typecheck 구성 검토
- `ts-jest`로 되돌릴지 여부 결정 (테스트 파일 타입 검사 이득 vs 이미 검증된 babel-jest 유지)

## 관련 문서

- [TypeScript 4.9 의존성 기준선 복구](./01-dependency-baseline.md)
- [테스트 기준선 복구](./02-test-baseline.md)
- [Yarn workspaces와 Lerna 역할 정리](./03-lerna-workspaces.md)
- [개발 도구 의존성 정리](./04-tooling-dependencies.md)
- [Node.js 지원 기준 현대화](./05-node-runtime.md)
- [TypeScript 6 업그레이드](./06-typescript-6.md)
