# web3 transaction

## Summary
This document explains how to create and submit transactions in the BEATOZ blockchain using the `@beatoz/web3` library, with examples.

## Transaction
To create a transaction for submission to the BEATOZ blockchain, the `@beatoz/web3` library provides functions in the `TrxProtoBuilder` for building transactions specific to their types.

### Transfer
You can create a transaction for transferring assets between `BEATOZ` accounts. The required arguments for `buildTransferTrxProto are as follows:
- from : Sending address
- to : Receiving address
- nonce : Nonce of the account
- amount : mount of BEATOZ to transfer
- gas : Gas amount
- gasPrice : Gas price


The following code is an example that uses `TrxProtoBuilder` to create a transaction and submit it to the BEATOZ test network.

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

### Delegation
You can create a transaction for delegating assets between `BEATOZ` accounts. The required arguments for `buildDelegateTrxProto are as follows:
- from : Sending address
- to : Receiving address
- nonce : Nonce of the account
- amount : mount of BEATOZ to transfer
- gas : Gas amount
- gasPrice : Gas price

The following code is an example that uses `TrxProtoBuilder` to create a delegation transaction and submit it to the BEATOZ test network.

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

### Unbonding Delegation
You can create an unbonding delegation transaction in the BEATOZ blockchain. The required arguments for `buildUnDelegateTrxProto` are as follows:
- from : Sending address
- to : Address for unbonding delegation
- nonce : Nonce of the account
- amount : '0'
- gas : Gas amount
- gasPrice : Gas price
- payload
  - txHash : Transaction hash of the delegation

The following code is an example that uses `TrxProtoBuilder` to create an unbonding delegation transaction and submit it to the BEATOZ test network.

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

### proposal
You can create a proposal transaction in the `BEATOZ` blockchain. A proposal transaction requires validator authority.
The required arguments for `buildProposalTrx` are as follows:
- from : Sending address
- to : '0000000000000000000000000000000000000000'
- nonce : Nonce of the account
- amount : '0'
- gas : Gas amount
- gasPrice : Gas price
- payload
  - message : Proposal message
  - startVotingHeight : Start block height
  - votingBlocks : Voting block height
  - applyingHeight : Block height at which the proposal will be applied
  - optType : Proposal type
  - options : Parameters to propose

The following code is an example that uses TrxProtoBuilder to create a proposal transaction and submit it to the BEATOZ test network.

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

### voting
You can create a voting transaction in the BEATOZ blockchain. A voting transaction requires validator authority.
The required arguments for `buildVotingTrx are as follows:
- from : Sending address
- to : '0000000000000000000000000000000000000000'
- nonce : Nonce of the account
- amount : '0'
- gas : Gas amount
- gasPrice : Gas price
- payload
    - txHash : Target voting hash
    - choice : Support or oppose

The following code is an example that uses `TrxProtoBuilder` to create a voting transaction and submit it to the BEATOZ test network.
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
You can create a setDoc transaction in BEATOZ. The required arguments for `buildSetDocTrx are as follows:
- from : Sending address
- to : Address where the setDoc will be set
- nonce : Nonce of the account
- amount : '0'
- gas : Gas amount
- gasPrice : Gas price
- payload
    - name: Name,
    - url: URL

The following code is an example that uses `TrxProtoBuilder` to create a setDoc transaction and submit it to the BEATOZ test network.
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

## Result
When a submission to the BEATOZ network is successful, the following result is returned.
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

It is possible to decode the result of a transaction queried from BEATOZ. The required argument for the decodeTransaction is as follows:
- d : BytesUint8Array of the transaction to be decoded.

The following code is an example that utilizes TrxProtoBuilder's decodeTransaction to decode a submitted transaction.

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

## Result
If decodeTransaction is executed successfully, the following result value will be returned.
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
