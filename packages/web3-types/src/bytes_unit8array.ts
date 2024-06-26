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

import * as cryptojs from 'crypto-js';

export class BytesUint8Array extends Uint8Array {
    static fromHex(hex: string): BytesUint8Array {
        if (hex.startsWith('0x')) {
            hex = hex.substring(2);
        }
        if (hex.length % 2 !== 0) {
            hex = '0' + hex;
        }
        const ret = new BytesUint8Array(hex.length / 2);
        for (let i = 0; i < ret.length; i++) {
            ret[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        return ret;
    }

    static fromWords(w: cryptojs.lib.WordArray): BytesUint8Array {
        const hexBytes = new BytesUint8Array(w.sigBytes);
        for (let i = 0; i < w.sigBytes; i++) {
            hexBytes[i] = (w.words[i >>> 0x2] >>> (0x18 - (i % 0x4) * 0x8)) & 0xff;
        }
        return hexBytes;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static parse(d: any, enc: string): BytesUint8Array {
        switch (enc) {
            case 'hex':
                return this.fromHex(d);
                break;
            case 'words':
                return this.fromWords(d);
                break;
            default:
                throw Error('not supported encoding: ' + enc);
        }
    }

    toHex(): string {
        let ret = '';
        for (let i = 0; i < this.length; i++) {
            const digits = this[i].toString(16);
            if (this[i] < 16) {
                ret += '0';
            }
            ret += digits;
        }
        return ret.toLowerCase();
    }

    toWords(): cryptojs.lib.WordArray {
        const wordCount = Math.ceil(this.length / 4);
        const words: number[] = new Array(wordCount).fill(0);

        for (let i = 0; i < this.length; i++) {
            words[i >>> 2] |= this[i] << (24 - (i % 4) * 8);
        }

        return cryptojs.lib.WordArray.create(words, this.length);
    }

    isEqual(o: BytesUint8Array): boolean {
        for (let i = 0; i < this.length; i++) {
            if (this[i] !== o[i]) {
                return false;
            }
        }
        return true;
    }

    static b64ToBytes(base64: string): BytesUint8Array {
        const binary_string =
            typeof window !== 'undefined'
                ? window.atob(base64)
                : Uint8Array.from(Buffer.from(base64, 'base64'));
        const len = binary_string.length;
        const bytes = new BytesUint8Array(len);
        for (let i = 0; i < len; i++) {
            if (typeof binary_string === 'string') {
                bytes[i] = binary_string.charCodeAt(i);
            } else {
                bytes[i] = binary_string[i];
            }
        }
        return bytes;
    }
}
