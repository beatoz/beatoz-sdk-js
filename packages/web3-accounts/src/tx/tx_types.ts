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

import { keccak256 } from 'ethereum-cryptography/keccak.js';
import { BytesUint8Array } from '@beatoz/web3-types';
import { sha3Raw } from '@beatoz/web3-utils';
import { createHash, randomBytes } from 'crypto';
import * as secp256k1 from 'secp256k1';

export interface Transaction<T> {
    hash?: string;
    version?: number;
    time?: Date;
    nonce?: number;
    from: string;
    to: string;
    amount: string;
    gas: number;
    gasPrice: string;
    type?: number;
    payload?: object | T;
    sig?: string;
}

export interface TransactionPayloadUnDelegating {
    txhash: string;
}

export class PubKey {
    compressed: BytesUint8Array;
    x: BytesUint8Array;
    y: BytesUint8Array;

    constructor(k: PrvKey) {
        const decompressed = secp256k1.publicKeyCreate(k.export(), false);
        this.x = new BytesUint8Array(decompressed.subarray(1, 33));
        this.y = new BytesUint8Array(decompressed.subarray(33, 65));

        this.compressed = new BytesUint8Array(33);
        if ((this.y[this.y.length - 1] & 1) === 0) {
            this.compressed[0] = 0x02;
        } else {
            this.compressed[0] = 0x03;
        }
        this.compressed.set(this.x, 1);
    }

    toAddress(): BytesUint8Array {
        return this.ethAddress();
    }

    shaAddress(): BytesUint8Array {
        const sha256 = createHash('sha256');
        const decompressed = new BytesUint8Array([...this.x, ...this.y]);
        const hash = sha256.update(decompressed).digest();
        return new BytesUint8Array(hash.subarray(hash.length - 20));
    }

    btcAddress(): BytesUint8Array {
        const sha256 = createHash('sha256');
        const ripemd160 = createHash('ripemd160');
        const hash = sha256.update(this.compressed).digest();
        const addr = ripemd160.update(hash).digest();
        return new BytesUint8Array(addr);
    }

    ethAddress(): BytesUint8Array {
        const decompressed = new BytesUint8Array([...this.x, ...this.y]);
        const pubKeyHash = keccak256(decompressed);
        const addr = pubKeyHash.slice(-20);
        return new BytesUint8Array(addr);
    }

    verify(sig: Uint8Array, msg: Uint8Array): boolean {
        const sha256 = createHash('sha256');
        const hmsg = sha256.update(msg).digest();
        const _sig = sig.subarray(0, 64);

        return secp256k1.ecdsaVerify(_sig, hmsg, this.compressed);
    }

    toHex(): string {
        return this.compressed.toHex();
    }
}

export class PrvKey {
    private d: BytesUint8Array;

    constructor() {
        let rn;
        do {
            rn = randomBytes(32);
        } while (!secp256k1.privateKeyVerify(rn));

        this.d = new BytesUint8Array(rn);
    }

    sign(msg: Uint8Array): { signature: Uint8Array; recid: number } {
        const sha256 = createHash('sha256');
        const hmsg = sha256.update(msg).digest();
        return secp256k1.ecdsaSign(hmsg, this.d);
    }

    export(): BytesUint8Array {
        return this.d;
    }

    static import(k: string | ArrayBufferLike): PrvKey {
        const ret = new PrvKey();
        if (typeof k === 'string') {
            ret.d = BytesUint8Array.fromHex(k);
        } else {
            ret.d = new BytesUint8Array(k);
        }
        return ret;
    }
}
