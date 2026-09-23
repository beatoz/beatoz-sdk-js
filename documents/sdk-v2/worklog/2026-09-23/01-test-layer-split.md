# 테스트 계층 분리

> 이 문서는 노드가 있어야만 도는 테스트를 `test/unit`에서 분리해 `yarn test`를 처음으로 통과 상태로 만든 과정과, 그 과정에서 확인한 사실을 기록합니다.

## 결론

- 비밀값과 노드에 의존하는 테스트 48개와 헬퍼 3개를 `test/unit/`에서 `test/integration/`으로 옮겼습니다.
- `web3` 패키지의 `testMatch`가 단일 파일만 잡도록 고정돼 있던 것을 정상 패턴으로 복원했습니다.
- 네트워크에 접속하지 않으면서도 헬퍼 때문에 끌려가 죽던 테스트 3개를 unit으로 되살렸습니다.
- `yarn test`가 13개 패키지 전부, 964개 테스트를 통과합니다. 이전에는 3개 패키지가 항상 실패했고 `web3` 패키지는 한 개도 실행하지 않았습니다.
- e2e 실행 환경은 로컬 컨테이너로 정했습니다. 공식 이미지 `beatoz/beatoz-re:v1.14.8`을 버전 고정해 사용합니다.

## 왜 필요했는가

작업 전 `yarn test`는 항상 실패했습니다. 이 상태에서는 무엇을 고치든 **원래 깨져 있던 것인지 이번 변경이 깨뜨린 것인지 구분할 수 없습니다.** 회귀 감지 능력이 없는 상태였고, 실제로 이전 작업에서 매번 "실패 3개는 기존과 동일"을 손으로 대조해야 했습니다.

## 확인한 사실

### 비밀값 의존 테스트는 51개였다

`test/unit/` 아래에 있지만 실제로는 살아있는 노드와 계정이 필요한 테스트가 51개였습니다.

| 분류 | 개수 | 성격 |
| --- | --- | --- |
| RPC 조회 | 32 | `block`, `status`, `validators` 등 메서드별 호출 |
| 트랜잭션 전송 | 5 | `broadcastTxCommit`으로 체인 상태를 변경 |
| 컨트랙트 | 7 | 배포·전송, 결과를 파일로 기록 |
| WebSocket | 2 | 실제 연결 수립 |
| 곁다리 | 5 | 헬퍼 하나 때문에 끌려온 것 |

### 실패 원인은 최상위 import였다

```ts
// test/unit/e2e_utils.ts
import secrets from '../../../../.secrets.json';
```

헬퍼가 파일 선두에서 비밀 파일을 import하므로, **이 헬퍼를 import하는 테스트는 자기가 노드를 쓰든 안 쓰든 로딩 단계에서 함께 죽습니다.** `web3` 패키지에서만 42개가 이 헬퍼를 참조합니다.

두 비밀 파일은 저장소 루트에 있어야 하지만 `.gitignore` 대상이라 clone 직후에는 존재하지 않습니다.

### 체인 상태를 하드코딩하고 있다

```ts
.block(10000)        .blockResults(10000)      .validators(10000)
txhash: '2bda7cddd29aa14dd938fc535f0b561cf20a5aca5ac4e8e73b28434aec1dbd78'
```

7개 테스트가 "블록 10000번이 존재하는 체인"을 전제합니다. 언스테이킹 테스트는 특정 스테이킹 트랜잭션이 그 체인에 실재해야 합니다. 이 때문에 테스트가 멱등하지 않고 재현되지 않습니다.

### `web3` 패키지는 애초에 테스트를 선택하지 않고 있었다

```js
// testMatch: ['<rootDir>/test/unit/**/*.(spec|test).(js|ts)'],   ← 주석 처리됨
// testMatch: [... setProvider ...],  // 단일 테스트
   ... 43줄 ...
   testMatch: ['<rootDir>/test/unit/**/subscribe.(spec|test).(js|ts)'],  ← 유일하게 활성
```

주석 처리된 `testMatch` 43줄이 남아 있었고, 활성 상태인 한 줄이 `subscribe` 하나만 잡고 있었습니다. 즉 43개 파일 중 **42개는 실패한 것이 아니라 선택조차 되지 않았습니다.** `Tests: 0 total`이 나오던 이유입니다.

테스트를 하나씩 수동으로 돌리기 위해 설정 파일의 줄을 갈아끼우던 흔적이며, 그 상태로 커밋됐습니다.

### 두 비밀 파일의 형식이 다르다

| | `.secrets.json` | `.providers.json` |
| --- | --- | --- |
| 사용처 | `e2e_utils.ts` 경유, 5개 패키지 | `web3-contract` 테스트가 직접 |
| 체인 ID 키 | `CHAIN_ID` | `CHAINID` |
| 계정 | `ACCOUNT.privateKey` (단수) | `ACCTS[].KEY` (배열) |
| 네트워크명 | `DEVNET`, `TESTNET` | `LOCALNET0`, `TESTNET0`, `MAINNET` |
| 템플릿 | **없음** | `.providers.template.json` |

`deploy.test.ts`는 템플릿에 존재하지 않는 `DEVNET0` 키를 참조합니다.

### 체인 ID가 실제 값과 다르다

| 대상 | 값 |
| --- | --- |
| testnet0 노드가 보고하는 `network` | `0xbea701` |
| `.providers.template.json` | `testnet0` |
| 테스트 코드 | `signTrxProto(tx, account, 'testnet0')` |
| `setProvider.test.ts` 단정 | `expect(...network).toEqual('testnet')` |

체인 ID는 서명 preimage에 포함되므로, 이 불일치가 남아 있으면 노드와 잔고가 준비돼도 트랜잭션이 서명 검증에서 거부될 수 있습니다. 이번 작업 범위 밖이며 후속으로 다룹니다.

## 다른 라이브러리의 방식

같은 문제를 다루는 저장소들을 조사했습니다.

| | 인코딩/서명 검증 | e2e 실행 | 자격증명 | 실행 시점 |
| --- | --- | --- | --- | --- |
| ethers | `@ethersproject/testcases`로 23,000개 벡터 배포 | CI가 Geth 직접 설치·실행 | GitHub Secrets | 소스가 바뀐 main 푸쉬만 |
| node-redis | — | 테스트가 Docker 이미지를 자동 pull | — | CI 매트릭스 |
| viem | 있음 | Anvil로 메인넷을 **특정 블록에 포크** | GitHub Secrets | PR, draft면 축소 실행 |

공통점이 셋 있습니다. **아무도 매 푸쉬마다 전부 돌리지 않고**, **자격증명은 예외 없이 환경변수/Secrets**이며, **노드를 CI가 직접 띄웁니다.** gitignore된 JSON 파일을 쓰는 곳은 없었습니다.

## e2e 실행 환경 결정

`beatoz-go`에 이미 `Dockerfile`과 entrypoint가 있고, 공식 이미지가 Docker Hub에 배포돼 있습니다.

실제로 띄워 확인한 결과는 다음과 같습니다.

```text
chain network : 0x1234        (entrypoint가 지정)
계정          : 10개 자동 생성
잔고          : 계정당 31,500,000 BTZ 상당
SDK 접속      : new Web3('http://localhost:26657') 으로 status/getAccount 정상 응답
```

entrypoint가 `genesis.json`이 없을 때만 초기화하므로, 미리 만든 `config/`와 `walkeys/`를 마운트하면 **매번 같은 계정·같은 체인**으로 띄울 수 있습니다.

따라서 다음과 같이 정했습니다.

- e2e는 외부 testnet이 아니라 **로컬 컨테이너**를 대상으로 한다.
- 이미지는 `beatoz/beatoz-re:v1.14.8`로 **버전을 고정**한다. `latest`를 쓰면 메인넷 배포가 SDK 테스트 결과를 조용히 바꾼다.
- SDK 저장소에는 이미지가 아니라 **그 이미지를 사용하겠다는 선언만** 둔다. 두 저장소는 소스로 연결되지 않고, 배포된 산출물을 소비하는 관계만 갖는다.

이 방식은 잔고 문제도 함께 해소합니다. genesis를 우리가 만들므로 테스트용 자금을 확보할 필요가 없고, 컨테이너를 지우면 상태도 사라집니다.

## 변경 내용

### 1. 곁다리 5개 판정

`getTestWsServer()` 하나 때문에 헬퍼에 끌려가던 5개를 검사해, 실제 네트워크 호출 여부로 갈랐습니다.

| 파일 | 네트워크 호출 | 처리 |
| --- | --- | --- |
| `utils.test.ts` | 없음 (`toFons` 순수 계산) | unit 유지 |
| `web3.test.ts` | 없음 (`instanceof` 검사) | unit 유지 |
| `account/accounts.test.ts` | 없음 (계정 생성·서명) | unit 유지 |
| `context/setProvider.test.ts` | `await status()` | integration 이동 |
| `context/multipleWeb3.test.ts` | `await status()` | integration 이동 |

앞의 3개는 `getTestWsServer()` 대신 자리표시자 엔드포인트를 쓰도록 바꿔 헬퍼 의존을 끊었습니다.

`accounts.test.ts`는 비밀 파일에서 읽던 키·주소를 고정 벡터로 교체했습니다. 이 주소는 `beatoz-go`의 `crypto.Pub2Addr`가 같은 개인키로 산출한 값이며, 기대값을 SDK 자신으로 만들면 검증이 성립하지 않으므로 상수로 박았습니다.

### 2. 디렉터리 분리

48개 테스트와 `e2e_utils.ts` 3개를 `test/unit/` → `test/integration/`으로 옮겼습니다. **깊이를 유지했으므로 상대 import를 한 줄도 고치지 않았습니다.**

```text
test/unit/rpc/block.test.ts       →  test/integration/rpc/block.test.ts
  import '../../../src'           →  동일 경로 유지
  import '../e2e_utils'           →  헬퍼도 함께 이동
```

| 패키지 | unit | integration |
| --- | --- | --- |
| `web3` | 4 | 39 |
| `web3-contract` | 1 | 7 |
| `web3-providers-ws` | 1 | 2 |

나머지 10개 패키지는 변경하지 않았습니다.

### 3. `testMatch` 정상화

`web3` 패키지의 주석 43줄을 삭제하고 전체 패턴으로 복원했습니다.

```js
testMatch: ['<rootDir>/test/unit/**/*.(spec|test).(js|ts)'],
```

디렉터리로 분리했으므로 **어떤 파일을 돌릴지 사람이 관리할 필요가 없어집니다.** 파일을 어느 폴더에 두느냐가 곧 분류입니다.

### 4. integration 실행 경로 신설

3개 패키지에 `test/integration/jest.config.js`를 만들고 `test:integration` 스크립트를 추가했습니다. 루트 스크립트는 `--parallel` 없이 순차 실행합니다.

```json
"test:integration": "lerna run test:integration --stream"
```

integration 테스트는 nonce와 배포 결과 파일을 공유하므로 병렬로 돌리면 서로 깨집니다. 개별 설정에도 `maxWorkers: 1`을 두었습니다.

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| `yarn test` | **13개 패키지 전부 통과, 964개** |
| `yarn build` | 13개 패키지 성공 |
| `npx eslint .` | 2건 (기존 `unsubscribe()` 관련, 변화 없음) |
| integration 파일 선택 | `web3` 39 / `web3-contract` 7 / `web3-providers-ws` 2 |

`yarn test` 변화는 다음과 같습니다.

```text
전:  3개 패키지 실패, web3 패키지는 0개 실행, 958개 통과
후:  13개 패키지 통과, web3 패키지 6개 실행, 964개 통과
```

## 남은 주의사항

- `test:integration`은 아직 통과하지 않습니다. 비밀 파일 두 개에 대한 최상위 import가 그대로 남아 있어 로딩 단계에서 실패합니다. 다음 작업에서 설정 진입점을 만들어 해소합니다.
- 블록 높이와 트랜잭션 해시를 하드코딩한 테스트는 빈 로컬 체인에서는 통과할 수 없습니다. 이동만 했을 뿐 재작성하지 않았습니다.
- 체인 ID 하드코딩(`'testnet0'`, `'testnet'`)이 코드와 단정 양쪽에 남아 있습니다.
- `web3-accounts`와 `web3-rpc`의 `test/unit/e2e_utils.ts`는 이제 참조하는 테스트가 없습니다. 삭제 여부를 정해야 합니다.

## 다음 작업

- 테스트 설정 진입점 신설: 비밀 파일 두 개를 환경변수 기반 단일 경로로 대체하고, 값이 없으면 로딩 실패가 아니라 skip으로 처리
- 고정 genesis와 walkeys를 커밋해 컨테이너에 마운트, 계정이 매 실행마다 바뀌지 않도록 고정
- 체인 ID를 코드에서 제거하고 노드에서 조회하도록 변경
- 블록 높이·트랜잭션 해시를 하드코딩한 테스트의 삭제 또는 재작성 판단
- golden vector 확장: 체인에서 받은 실제 트랜잭션으로 인코딩 왕복과 서명자 복구를 고정
