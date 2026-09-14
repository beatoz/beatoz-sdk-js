# Node.js 지원 기준 현대화

> 이 문서는 TypeScript 업그레이드에 앞서 BEATOZ SDK의 Node.js 지원 정책을 Node 22와 24 기준으로 변경한 이유와 검증 방법을 기록합니다.

## 결론

- SDK 소비자가 사용할 수 있는 최소 버전은 Node 22입니다.
- 저장소의 로컬 개발 기본 버전은 Node 24입니다.
- 루트와 13개 workspace의 `engines.node`를 `>=22.0.0`으로 통일했습니다.
- `.nvmrc`에는 `24`를 지정했습니다.
- CI를 추가할 때는 Node 22와 24를 모두 검증해야 합니다.
- Node `22.22.3`과 `24.21.0`에서 frozen install, 의존성 트리 검사, 전체 빌드가 모두 성공했습니다.

## 왜 Node 버전도 올리는가

기존 저장소는 Node `>=16.19.0`을 선언했지만 실제 lockfile에는 Node 18 이상을 요구하는 런타임 및 개발 도구 의존성이 포함되어 있었습니다. 선언만 보면 Node 16에서 동작할 것 같지만 실제 설치나 실행은 보장할 수 없는 상태였습니다.

또한 다음 업그레이드 대상인 TypeScript `7.0.2`도 Node `>=16.20.0`을 요구합니다. 현재의 `16.19.0` 선언을 유지한 채 TypeScript만 올리는 것은 불가능합니다.

Node 16 지원을 유지하려면 `secp256k1`, `web3-eth-contract`의 하위 의존성, Lerna 및 Browserslist 하위 의존성을 과거 버전으로 강제 고정해야 합니다. 이 방식은 보안 업데이트와 이후 도구 업그레이드를 어렵게 하므로 채택하지 않았습니다.

2026-09-14 기준 Node 공식 일정에서 Node 22는 Maintenance LTS이며 2027-04-30까지, Node 24는 Active LTS이며 2028-04-30까지 지원될 예정입니다. 세부 일정은 [Node.js Release Working Group](https://github.com/nodejs/Release#release-schedule)에서 확인합니다.

## 최소 지원 버전과 개발 기본 버전의 차이

`engines.node`와 `.nvmrc`는 역할이 다릅니다.

| 설정 | 값 | 의미 |
| --- | --- | --- |
| 모든 `package.json`의 `engines.node` | `>=22.0.0` | SDK 설치 및 실행을 지원하는 최소 Node 버전 |
| 루트 `.nvmrc` | `24` | 개발자가 이 저장소에서 기본으로 사용할 Node 버전 |

최소 버전을 Node 24로 정하면 아직 지원 중인 Node 22 사용자가 SDK를 설치할 수 없게 됩니다. 따라서 라이브러리 소비자 범위는 Node 22 이상으로 두고, 개발과 주 검증 환경은 Node 24로 운영합니다.

## 변경 범위

- 루트 `package.json`
- `packages/*` 아래 13개 workspace의 `package.json`
- 루트 `.nvmrc`
- 한글 및 영문 시작 문서

현재 저장소에는 CI workflow가 없습니다. 향후 CI를 추가할 때 Node 22와 24 matrix를 구성하고 두 버전 모두에서 frozen install, build, test를 실행해야 합니다.

## 로컬 사용 방법

nvm을 사용하는 경우 저장소 루트에서 다음과 같이 개발 버전을 적용합니다.

```sh
nvm install
nvm use
node --version
```

`.nvmrc`의 `24`를 읽어 설치 및 선택하므로 개발자마다 다른 Node 버전을 사용하는 문제를 줄일 수 있습니다.

## 검증 결과

Node 22와 Node 24에서 각각 다음 명령을 실행했습니다.

```sh
yarn install --frozen-lockfile
yarn check --verify-tree
yarn build
```

| 환경 | frozen install | 의존성 트리 | 전체 빌드 | accounts 단위 테스트 |
| --- | --- | --- | --- | --- |
| Node `22.22.3`, Yarn `1.22.15` | 성공 | 성공 | 13개 패키지 성공 | 2 suites, 3 tests 성공 |
| Node `24.21.0`, Yarn `1.22.15` | 성공 | 성공 | 13개 패키지 성공 | 2 suites, 3 tests 성공 |

설치된 모든 패키지의 `engines.node`를 최소 지원 버전인 Node `22.0.0`과 비교한 결과 호환되지 않는 패키지는 0개였습니다.

두 버전 모두에서 Lerna 6의 deprecated API, 최대 listener 수, 색상 환경변수 관련 경고가 출력됩니다. 빌드 실패 원인은 아니지만 Lerna 업그레이드 단계에서 별도로 정리합니다.

테스트 기준선은 별도 문서에 기록된 기존 integration 환경 문제를 해결한 뒤 Node version matrix에 포함합니다.

## 다음 작업

- Lerna 업그레이드 시 Node 22/24 경고 재검토
- TypeScript 7 업그레이드 시작
