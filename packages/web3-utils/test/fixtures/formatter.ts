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
import { FMT_NUMBER, FMT_BYTES } from '@beatoz/web3-types';
import { hexToBytes } from '../../src/converters';

export const isDataFormatValid: [any, boolean][] = [
    [{ number: 'number', bytes: 'number' }, true],
    [{}, false],
];

export const convertScalarValueValid: [[any, any, any], any][] = [
    [[new Uint8Array(hexToBytes('FF')), 'bytes', { bytes: FMT_BYTES.HEX }], '0xff'],
    [
        [
            '0xe84375b25f38de0e68f7f4884b7342e0814747143c790f48088d22e802cf7a3',
            'bytes32',
            { bytes: FMT_BYTES.HEX },
        ],
        '0x0e84375b25f38de0e68f7f4884b7342e0814747143c790f48088d22e802cf7a3',
    ],
    [[100, 'int', { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX }], 100],
    [[100, 'int', { number: 'unknown', bytes: FMT_BYTES.HEX }], 100],
    [[100, 'uint', { number: FMT_NUMBER.HEX, bytes: FMT_BYTES.HEX }], '0x64'],
    [[64, 'uint8', { number: FMT_NUMBER.STR }], '64'],
    [
        [new Uint8Array(hexToBytes('FF')), 'bytes', { bytes: FMT_BYTES.UINT8ARRAY }],
        new Uint8Array(new Uint8Array(hexToBytes('FF'))),
    ],
    [
        [new Uint8Array(hexToBytes('FF')), 'bytes32', { bytes: FMT_BYTES.HEX }],
        '0x00000000000000000000000000000000000000000000000000000000000000ff',
    ],
    [
        [new Uint8Array(hexToBytes('FF')), 'unknown', { bytes: FMT_BYTES.HEX }],
        new Uint8Array(hexToBytes('FF')),
    ],
    [
        [new Uint8Array(hexToBytes('FF')), 'bytes32', { bytes: FMT_BYTES.UINT8ARRAY }],
        new Uint8Array(
            hexToBytes('0x00000000000000000000000000000000000000000000000000000000000000ff'),
        ),
    ],
];
