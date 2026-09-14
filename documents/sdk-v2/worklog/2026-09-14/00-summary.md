# 2026-09-14 작업 요약

상태: 개발 도구 의존성 정리 및 Node 22/24 지원 정책 반영 완료

> 오늘은 TypeScript 7 업그레이드 전에 현재 SDK의 의존성 충돌을 해결했고, 전체 빌드와 타입 선언 빌드가 성공하는 재현 가능한 기준선을 만들었습니다.

## 오늘의 결론

TypeScript `4.9.5` 기준에서 Webpack 및 minimatch 타입 충돌을 해결했습니다. Yarn workspaces와 중복되는 `lerna bootstrap`도 제거했으며, 변경 후 전체 빌드가 성공했습니다. 전체 테스트에는 별도의 Jest 경로 및 `.secrets.json` 문제가 남아 있습니다.

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

## 다음 작업

- `.secrets.json`이 필요한 테스트의 unit/integration 경계 결정
- `web3-contract`의 외부 fixture, 모듈 해석 및 기존 테스트 코드 오류 정리
- 기존 lint 오류를 포맷 위반과 코드 품질 위반으로 분류
- 전체 테스트 기준선 복구 후 TypeScript 업그레이드 시작

## 관련 문서

- [TypeScript 4.9 의존성 기준선 복구](./01-dependency-baseline.md)
- [테스트 기준선 복구](./02-test-baseline.md)
- [Yarn workspaces와 Lerna 역할 정리](./03-lerna-workspaces.md)
- [개발 도구 의존성 정리](./04-tooling-dependencies.md)
- [Node.js 지원 기준 현대화](./05-node-runtime.md)
