# web3-accounts

## Summary
This module provides utilities for handling BEATOZ accounts and signing transactions using the Web3 library.

## Getting Started

### `create()`
The `create` function generates a random BEATOZ account. Upon completion, it returns an `Web3Account` object.
```typescript
import { Web3 } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create address
const account: Web3Account = web3.beatoz.accounts.create();
```
### `privateKeyToAccount(privateKey)`
The `privateKeyToAccount` function returns an `Web3Account` object from the provided private key.
```typescript
import { Web3 } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);
```
The returned `Web3Account` object is as follows.
```shell
{
    address: string,
    privateKey: string,
    prvKey: PrvKey,
    pubKey: PubKey,
    sign: [Function: sign],
    signTransaction: [Function: signTransaction]
}
```

### `signTransaction(trxProto, chainId)`
The `signTransaction` function signs a transaction. To sign a transaction, you need the `CHAIN ID` of the BEATOZ blockchain where you intend to submit the transaction. The required arguments for `signTransaction` are as follows:
- TrxProto : The transaction format for submission to the BEATOZ network.
- ChainId : The Chain ID of the BEATOZ network.

Here's an example of implementing a testnet BEATOZ transfer using the `signTransaction` with the help of the `Web3Account` object.
```typescript
import { Web3, TrxProtoBuilder, TrxProto } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';

// create web3 instance
const web3 = new Web3('https://rpc1.testnet.beatoz.io');

// import private key
const privateKey: string = 'your private key';
const account: Web3Account = privateKeyToAccount(privateKey);

// get accountInfo
const accountInfo = await web3.beatoz.getAccount(account.address);

// create transaction
const trxProto: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
    from: account.value.address,
    nonce: account.value.nonce,
    to: 'address',
    amount: '100',
    gas: 1000000,
    gasPrice: '250000000000',
});

// sign transaction
const { rawTransaction } = account.signTransaction(tx, 'testnet0');

// broadcast raw transaction
const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
console.log(result);
```
The result of the code is as follows.
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
