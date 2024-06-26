# web3 transaction

## 개요
이 문서는 `@beatoz/web3` 라이브러리를 사용하여 `BEATOZ` 블록체인의 트랜잭션을 생성하고, 제출하는 방법에 대해서 
예시를 통해 설명합니다.

## 트랜잭션
`BEATOZ` 블록체인에 제출하기 위한 트랜잭션을 생성하기 위해서 `@beatoz/web3`의 `TrxProtoBuilder` 에서는 트랜잭션 타입 별 빌드하기 위한 함수들을 제공합니다.

### 거래
`BEATOZ` 계정 간의 거래를 위한 트랜잭션을 생성할 수 있습니다. 
`buildTransferTrxProto`의 필수 인자 값은 아래와 같습니다.
- from : 보내는 주소
- to : 받는 주소
- nonce : 계정의 nonce
- amount : 전송하고자 하는 BEATOZ 수량
- gas : 가스 수량
- gasPrice : 가스 가격

아래의 코드는 `TrxProtoBuilder`의 `buildTransferTrxProto` 를 사용하여 트랜잭션을 생성하고, `BEATOZ` 테스트 네트워크에 제출하는 예시입니다.

```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
    from: accountInfo.value.address,
    to: 'address',
    nonce: account.value.nonce,
    amount: '100',
    gas: 1000000,
    gasPrice: '250000000000',
});

// sign transaction
const { rawTransaction } = account.signTransaction(tx, 'testnet0');

// broadcast raw transaction
const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
```

### 위임
`BEATOZ` 계정 간의 위임를 위한 트랜잭션을 생성할 수 있습니다.
`buildDelegateTrxProto`의 필수 인자 값은 아래와 같습니다.
- from : 보내는 주소
- to : 위임 대상 주소
- nonce : 계정의 nonce
- amount : 전송하고자 하는 BEATOZ 수량
- gas : 가스 수량
- gasPrice : 가스 가격

아래의 코드는 `TrxProtoBuilder`의 `buildDelegateTrxProto` 를 사용하여 트랜잭션을 생성하고, `BEATOZ` 테스트 네트워크에 제출하는 예시입니다.

```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildDelegateTrxProto({
    from: accountInfo.value.address,
    to: accountInfo.value.address,
    nonce: accountInfo.value.nonce,
    amount: web3.utils.toFons('100', 'beatoz'),
    gas: 1000000,
    gasPrice: '250000000000',
});

// sign transaction
const { rawTransaction } = account.signTransaction(tx, 'testnet0');

// broadcast raw transaction
const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
```

### 위임 취소
`BEATOZ` 위임 취소 트랜잭션을 생성할 수 있습니다.
`buildUnDelegateTrxProto`의 필수 인자 값은 아래와 같습니다.
- from : 보내는 주소
- to : 위임 취소 주소
- nonce : 계정의 nonce
- amount : '0'
- gas : 가스 수량
- gasPrice : 가스 가격
- payload
  - txHash : 위임했던 트랜잭션 해시 값

아래의 코드는 `TrxProtoBuilder`의 `buildUnDelegateTrxProto` 를 사용하여 트랜잭션을 생성하고, `BEATOZ` 테스트 네트워크에 제출하는 예시입니다.

```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// delegate transaction hash
const delegateHash = 'delegate hash';

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildUnDelegateTrxProto({
    from: accountInfo.value.address,
    to: accountInfo.value.address,
    nonce: accountInfo.value.nonce,
    gas: 1000000,
    gasPrice: '250000000000',
    amount: '0',
    payload: {
        txhash: delegateHash
    },
});

// sign transaction
const { rawTransaction } = account.signTransaction(tx, 'testnet0');

// broadcast raw transaction
const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
```

### 제안
`BEATOZ` 제안 트랜잭션을 생성할 수 있습니다. 제안 트랜잭션은 validator 권한이 필수적입니다.
`buildProposalTrx`의 필수 인자 값은 아래와 같습니다.
- from : 보내는 주소
- to : '0000000000000000000000000000000000000000'
- nonce : 계정의 nonce
- amount : '0'
- gas : 가스 수량
- gasPrice : 가스 가격
- payload
  - message : 제안 메시지
  - startVotingHeight : 시작 블록 높이
  - votingBlocks : 투표 블록 높이
  - applyingHeight : 제안이 적용될 블록 높이
  - optType : 제안 타입
  - options : 제안 할 파라미터

아래의 코드는 `TrxProtoBuilder`의 `buildProposalTrx` 를 사용하여 트랜잭션을 생성하고, `BEATOZ` 테스트 네트워크에 제출하는 예시입니다.

```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';
import Long from "long";

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// proposal
const governanceParams = {
    param : 'value'
}
const selizalizedParams = serializeObject(governanceParams);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildUnDelegateTrxProto({
    from: accountInfo.value.address,
    to: '0000000000000000000000000000000000000000',
    nonce: accountInfo.value.nonce,
    gas: 1000000,
    gasPrice: '250000000000',
    amount: '0',
    payload: {
        message: 'your message',
        startVotingHeight: Long.fromValue(/* startVotingHeight */),
        votingBlocks: Long.fromValue(/* votingBlocks */),
        applyingHeight: Long.fromValue(/* applyingHeight */),
        optType: 257,
        options: selizalizedParams,
    },
});

// sign transaction
const { rawTransaction } = account.signTransaction(tx, 'testnet0');

// broadcast raw transaction
const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
```

### 투표
`BEATOZ` 투표 트랜잭션을 생성할 수 있습니다. 투표 트랜잭션은 validator 권한이 필수적입니다.
`buildVotingTrx`의 필수 인자 값은 아래와 같습니다.
- from : 보내는 주소
- to : '0000000000000000000000000000000000000000'
- nonce : 계정의 nonce
- amount : '0'
- gas : 가스 수량
- gasPrice : 가스 가격
- payload
    - txHash : 대상 투표 해시 값
    - choice : 찬성 및 반대

아래의 코드는 `TrxProtoBuilder`의 `buildVotingTrx` 를 사용하여 트랜잭션을 생성하고, `BEATOZ` 테스트 네트워크에 제출하는 예시입니다.

```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse, BytesUint8Array } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// voting hash
const votingHash = BytesUint8Array.fromHex('proposal transaction hash');

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildVotingTrx({
    from: accountInfo.value.address,
    to: '0000000000000000000000000000000000000000',
    nonce: accountInfo.value.nonce,
    gas: 1000000,
    gasPrice: '250000000000',
    amount: '0',
    payload: {
        txhash: votingHash,
        choice: 0,
    },
});

// sign transaction
const { rawTransaction } = account.signTransaction(tx, 'testnet0');

// broadcast raw transaction
const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
```

### setDoc
`BEATOZ` setDoc 트랜잭션을 생성할 수 있습니다.
`buildSetDocTrx`의 필수 인자 값은 아래와 같습니다.
- from : 보내는 주소
- to : setDoc 대상 주소
- nonce : 계정의 nonce
- amount : '0'
- gas : 가스 수량
- gasPrice : 가스 가격
- payload
    - name: 이름,
    - url: URL

아래의 코드는 `TrxProtoBuilder`의 `buildSetDocTrx` 를 사용하여 트랜잭션을 생성하고, `BEATOZ` 테스트 네트워크에 제출하는 예시입니다.

```typescript
import { Web3, TrxProtoBuilder, TrxProto, AccountResponse } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo: AccountResponse = await web3.beatoz.getAccount(account.address);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildSetDocTrx({
    from: accountInfo.value.address,
    to: accountInfo.value.address,
    nonce: accountInfo.value.nonce,
    gas: 1000000,
    gasPrice: '250000000000',
    amount: '0',
    payload: {
        name: "name",
        url: "URL",
    },
});

// sign transaction
const { rawTransaction } = account.signTransaction(tx, 'testnet0');

// broadcast raw transaction
const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
```

## 결과
`BEATOZ` 네트워크의 제출이 정상적으로 수행되면 아래의 결과 값이 리턴됩니다.
```shell
{
  height: 280652,
  hash: '96289E5CA50E28AAB181E9D2E13367B82C06DAF9F34DB013EE2A1F4AAA77CFB2',
  check_tx: {
    code: 0,
    codespace: '',
    log: '',
    data: null,
    events: [],
    gas_wanted: '1000000',
    gas_used: '1000000'
  },
  deliver_tx: {
    code: 0,
    codespace: '',
    log: '',
    data: null,
    events: [ [Object] ],
    gas_wanted: '1000000',
    gas_used: '1000000'
  }
}
```

### decodeTransaction
`BEATOZ`에서 조회한 트랜잭션의 결과 값을 디코딩할 수 있습니다.
`decodeTransaction`의 필수 인자 값은 아래와 같습니다.
- d : 디코딩할 대상 트랜잭션의 BytesUint8Array

아래의 코드는 `TrxProtoBuilder`의 `decodeTransaction` 를 사용하여 제출된 트랜잭션을 디코딩하는 예시입니다.

```typescript
import { Web3, TrxProtoBuilder } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

const tx = 'dd50bd3118acf45cf1c3b55a516bf8bad7905c37679d12236ad2f624aead5e41';
const data = await web3.beatoz.tx(tx);

const bytesData = BytesUint8Array.b64ToBytes(data.tx);
const result = TrxProtoBuilder.decodeTransaction(bytesData);
console.log(result);
```

## 결과
`decodeTransaction`이 정상적으로 수행되면 아래의 결과 값이 리턴됩니다.
```shell
{
  hash: 'dd50bd3118acf45cf1c3b55a516bf8bad7905c37679d12236ad2f624aead5e41',
  version: 1,
  time: 2023-12-01T11:00:39.704Z,
  nonce: 11,
  from: '66c44877759d97a9a78be296fd72e1a7e9cce190',
  to: 'd71e8104a28c1fe1fcfb89e5fa67bc21f424fc80',
  amount: '1000000000000000000000',
  gas: 1000000,
  gasPrice: '250000000000',
  type: 1,
  payload: undefined,
  sig: 'e5274bf14ed4aee71fd3989db31518769b683285baca3a1b8647bf5fd57a6d50368fbd232a3bf300b666b7e367d8408458c60325b744d1e876c86005042dac8700'
}
```