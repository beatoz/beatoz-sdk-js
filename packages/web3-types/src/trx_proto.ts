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
import Long from 'long';

export interface TrxProto {
    version: number;
    time: Long;
    nonce: Long;
    from: Uint8Array;
    to: Uint8Array;
    Amount: Uint8Array;
    gas: Long;
    GasPrice: Uint8Array;
    type: number;
    Payload: Uint8Array;
    sig: Uint8Array;
}
