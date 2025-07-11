/*
    Copyright 2023 All BEATOZ Developers

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
import { Web3Account, SignTransactionResult } from './types.js';
import { PrvKey, PubKey } from './tx/tx_types.js';
import { HexString, TrxProto, BytesUint8Array } from '@beatoz/web3-types';
import { TrxProtoUtils } from './tx/trx_pb.js';
import { RlpUtils } from './tx/trx_rlp.js';
import { createHash } from 'crypto';

export const create = (): Web3Account => {
    const prvKey = new PrvKey();
    return prvKeyToAccount(prvKey);
};

export const privateKeyToAccount = (privateKey: HexString | ArrayBufferLike): Web3Account => {
    const prvKey = PrvKey.import(privateKey);
    return prvKeyToAccount(prvKey);
};

export const privateKeyToPrvKey = (privateKey: HexString | ArrayBufferLike): PrvKey => {
    return PrvKey.import(privateKey);
};

export const prvKeyToAccount = (prvKey: PrvKey): Web3Account => {
    const pubKey = new PubKey(prvKey);

    return {
        address: pubKey.toAddress().toHex(),
        prvKey: prvKey,
        pubKey: pubKey,
        privateKey: prvKey.export().toHex(),
        sign: (msg: Uint8Array) => sign(msg, prvKey.export().toHex()),
        signTransaction: (trxProto: TrxProto, chainId) =>
            signTransaction(trxProto, prvKey.export().toHex(), chainId),
    };
};

export const sign = (msg: Uint8Array, privateKey: HexString | ArrayBufferLike): BytesUint8Array => {
    const signObj = privateKeyToPrvKey(privateKey).sign(msg);
    return new BytesUint8Array([...signObj.signature, signObj.recid & 0xff]);
};

export const signTransaction = (
    trxProto: TrxProto,
    privateKey: HexString,
    chainId: string,
): SignTransactionResult => {
    const encodedData = RlpUtils.encodeTrxProto(trxProto);
    const prefix = `\x19BEATOZ(${chainId}) Signed Message:\n${encodedData.length}`;
    const prefixedData = Buffer.concat([Buffer.from(prefix), encodedData]);
    trxProto.sig = sign(new BytesUint8Array(prefixedData), privateKey);


    const sha256 = createHash('sha256');

    const signedTxByte = new BytesUint8Array(TrxProtoUtils.encode(trxProto).finish());
    const rawTransaction = Buffer.from(signedTxByte); //.toString('base64');
    const transactionHash = sha256.update(rawTransaction).digest();
    return {
        rawTransaction: rawTransaction.toString('base64'),
        transactionHash: transactionHash.toString('hex'),
    };
};