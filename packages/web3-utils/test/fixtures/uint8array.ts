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
export const uint8ArrayConcatData: [Uint8Array[], Uint8Array][] = [
    [[new Uint8Array([0]), new Uint8Array([0])], new Uint8Array([0, 0])],
    [
        [
            new Uint8Array([
                0xde, 0xc0, 0x51, 0x8f, 0xa6, 0x72, 0xa7, 0x00, 0x27, 0xb0, 0x4c, 0x28, 0x65, 0x82,
                0xe5, 0x43,
            ]),
            new Uint8Array([
                0xab, 0x17, 0x31, 0x9f, 0xbd, 0xd3, 0x84, 0xfa, 0x7b, 0xc8, 0xf3, 0xd5, 0xa5, 0x42,
                0xc0,
            ]),
        ],
        new Uint8Array([
            0xde, 0xc0, 0x51, 0x8f, 0xa6, 0x72, 0xa7, 0x00, 0x27, 0xb0, 0x4c, 0x28, 0x65, 0x82,
            0xe5, 0x43, 0xab, 0x17, 0x31, 0x9f, 0xbd, 0xd3, 0x84, 0xfa, 0x7b, 0xc8, 0xf3, 0xd5,
            0xa5, 0x42, 0xc0,
        ]),
    ],
    [
        [new Uint8Array([0x41]), new Uint8Array([0x42]), new Uint8Array([0x43])],
        new Uint8Array([0x41, 0x42, 0x43]),
    ],
    [
        [new Uint8Array([12, 12]), new Uint8Array([13]), new Uint8Array([14])],
        new Uint8Array([12, 12, 13, 14]),
    ],
];
const singleArray = new Uint8Array([0x13]);
export const uint8ArrayEqualsValidData: [[Uint8Array, Uint8Array], boolean][] = [
    [[new Uint8Array([0]), new Uint8Array([0])], true],
    [
        [
            new Uint8Array([
                0xde, 0xc0, 0x51, 0x8f, 0xa6, 0x72, 0xa7, 0x00, 0x27, 0xb0, 0x4c, 0x28, 0x65, 0x82,
                0xe5, 0x43,
            ]),
            new Uint8Array([
                0xde, 0xc0, 0x51, 0x8f, 0xa6, 0x72, 0xa7, 0x00, 0x27, 0xb0, 0x4c, 0x28, 0x65, 0x82,
                0xe5, 0x43,
            ]),
        ],
        true,
    ],
    [[new Uint8Array([12, 12]), new Uint8Array([12, 12])], true],
    [[new Uint8Array([0]), new Uint8Array([1])], false],
    [[new Uint8Array([0x00]), new Uint8Array([0])], true],
    [[new Uint8Array([0x1]), new Uint8Array([1])], true],
    [
        [
            new Uint8Array([
                0xde, 0xc0, 0x51, 0x8f, 0xa6, 0x72, 0xa7, 0x00, 0x27, 0xb0, 0x4c, 0x28, 0x65, 0x82,
                0xe5, 0x43,
            ]),
            new Uint8Array([0]),
        ],
        false,
    ],
    [[singleArray, singleArray], true],
];
