# 2026-09-23 작업 요약

상태: 테스트 계층 분리 완료, `yarn test` 전체 통과

> 오늘은 노드가 있어야만 도는 테스트를 `test/unit`에서 분리해 `yarn test`를 처음으로 통과 상태로 만들었습니다. 그 과정에서 `web3` 패키지가 테스트를 한 개도 선택하지 않고 있었다는 사실과, 체인 ID가 실제 노드 값과 다르다는 사실을 확인했습니다. e2e 실행 환경은 로컬 컨테이너로 정했습니다.

## 오늘의 결론

`test/unit/`에 섞여 있던 비밀값·노드 의존 테스트 48개와 헬퍼 3개를 `test/integration/`으로 옮기고, `web3` 패키지의 고장난 `testMatch`를 복원했습니다. 네트워크에 접속하지 않으면서도 헬퍼 때문에 함께 죽던 테스트 3개는 unit으로 되살렸습니다. 그 결과 `yarn test`가 13개 패키지 전부, 964개 테스트를 통과합니다. 이전에는 3개 패키지가 항상 실패했고 `web3` 패키지는 한 개도 실행하지 않았습니다. e2e는 외부 testnet 대신 공식 이미지 `beatoz/beatoz-re:v1.14.8`을 버전 고정해 띄운 로컬 컨테이너를 대상으로 하기로 했습니다. 실제로 띄워 계정 10개에 잔고가 배정되고 SDK가 정상 접속하는 것까지 확인했습니다.

## 해결하려던 문제

`yarn test`가 항상 실패해서, 무엇을 고치든 원래 깨진 것인지 이번 변경이 깨뜨린 것인지 구분할 수 없었습니다. 회귀 감지 능력이 없는 상태를 먼저 해소해야 이후 작업이 안전해집니다.

## 확인한 사실과 근거

- `test/unit/` 아래 비밀값·노드 의존 테스트가 51개 (RPC 조회 32, 트랜잭션 전송 5, 컨트랙트 7, WebSocket 2, 곁다리 5)
- 실패 원인은 `e2e_utils.ts`의 최상위 `import secrets from '../../../../.secrets.json'` — 헬퍼를 참조하면 노드 사용 여부와 무관하게 로딩 단계에서 함께 죽음
- `web3` 패키지 `testMatch`에 주석 처리된 43줄이 남아 있고, 활성 한 줄이 `subscribe` 하나만 잡고 있었음 → 42개 파일은 실패한 게 아니라 **선택조차 되지 않았음**
- 비밀 파일이 두 개이고 형식이 다름: `CHAIN_ID` vs `CHAINID`, `ACCOUNT`(단수) vs `ACCTS`(배열), 네트워크명도 상이
- `.secrets.json`은 템플릿이 없어 clone 후 형식을 역추적해야 함
- `deploy.test.ts`가 템플릿에 없는 `DEVNET0` 키를 참조
- 7개 테스트가 "블록 10000번 존재"를 전제하고, 언스테이킹 테스트는 특정 트랜잭션 해시가 체인에 실재해야 함
- testnet0 노드의 실제 `network`는 `0xbea701`인데 템플릿과 코드는 `testnet0`·`testnet`을 사용 — 서명 preimage에 들어가는 값이므로 불일치 시 거부될 수 있음
- testnet0는 정상 동작 중이며 블록 320,704, 트랜잭션 61,877개 보유 (golden vector 표본으로 사용 가능)
- `beatoz-go`에 `Dockerfile`과 entrypoint가 이미 존재하고, 공식 이미지가 Docker Hub에 `beatoz/beatoz-re:v1.14.8`로 배포돼 있음
- 로컬 컨테이너 실행 검증: chain `0x1234`, 계정 10개 자동 생성, 계정당 31,500,000 BTZ 상당 잔고, SDK가 `status`/`getAccount` 정상 응답
- entrypoint가 `genesis.json` 부재 시에만 초기화하므로 `config/`·`walkeys/` 마운트로 계정 고정 가능
- 다른 라이브러리 조사: ethers는 테스트 벡터 23,000개를 별도 패키지로 배포하고 CI가 Geth를 직접 설치, node-redis는 테스트가 Docker 이미지를 자동 pull, viem은 Anvil로 특정 블록에 포크. 셋 다 자격증명은 환경변수/Secrets이며 gitignore된 JSON을 쓰는 곳은 없음
- 실행 시점도 매 푸쉬가 아님: viem은 PR(draft면 축소), ethers는 소스가 바뀐 main 푸쉬만

## 결정한 사항

- 테스트 계층은 파일명 접두사가 아니라 **디렉터리**로 분리 — 사람이 이름을 관리하지 않아도 `testMatch`가 기계적으로 가름
- 이동 시 디렉터리 깊이를 유지해 상대 import를 수정하지 않음
- e2e 대상은 외부 testnet이 아니라 **로컬 컨테이너**
- 이미지는 `beatoz/beatoz-re:v1.14.8`로 **버전 고정** — `latest`는 메인넷 배포가 SDK 테스트 결과를 조용히 바꿈
- SDK 저장소에는 이미지가 아니라 사용 선언만 둠 — 두 저장소는 소스로 연결하지 않고 배포 산출물만 소비
- `test:integration`은 `--parallel` 없이 순차 실행, 개별 설정에도 `maxWorkers: 1` — nonce와 배포 결과 파일을 공유하므로
- 네트워크를 쓰지 않는 테스트는 자리표시자 엔드포인트로 헬퍼 의존만 끊어 unit에 유지
- `accounts.test.ts`의 기대값은 `beatoz-go` 파생 주소를 상수로 고정 — 기대값을 SDK 자신으로 만들면 검증이 성립하지 않음
- 코드 주석은 영어, 문서는 한글로 통일

## 다음 작업

- 테스트 설정 진입점 신설: 비밀 파일 두 개를 환경변수 기반 단일 경로로 대체, 값이 없으면 로딩 실패가 아니라 skip
- 고정 genesis·walkeys를 커밋해 컨테이너에 마운트, 계정을 실행 간 고정
- 체인 ID를 코드에서 제거하고 노드에서 조회
- 블록 높이·트랜잭션 해시를 하드코딩한 테스트의 삭제 또는 재작성 판단
- `web3-accounts`·`web3-rpc`의 미참조 `e2e_utils.ts` 삭제 여부 결정
- golden vector 확장: 체인의 실제 트랜잭션으로 인코딩 왕복과 서명자 복구 고정
- `Web3SubscriptionManager.unsubscribe()` 수정 여부 결정 (남은 lint 2건)

## 관련 문서

- [테스트 계층 분리](./01-test-layer-split.md)
- [2026-09-14 작업](../2026-09-14/00-summary.md)
