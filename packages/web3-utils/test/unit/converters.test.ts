﻿/*
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
import {
    asciiToHex,
    bytesToHex,
    fromAscii,
    fromDecimal,
    fromUtf8,
    fromFons,
    hexToAscii,
    hexToBytes,
    hexToNumber,
    hexToNumberString,
    hexToString,
    hexToUtf8,
    numberToHex,
    stringToHex,
    toAscii,
    toDecimal,
    toHex,
    toNumber,
    toUtf8,
    toFons,
    utf8ToHex,
    toChecksumAddress,
    bytesToUint8Array,
    toBigInt,
} from '../../src/converters';

import {
    asciiToHexValidData,
    bytesToHexInvalidData,
    bytesToHexValidData,
    fromFonsInvalidData,
    fromFonsValidData,
    hexToAsciiValidData,
    hexToBytesInvalidData,
    hexToBytesValidData,
    hexToNumberInvalidData,
    hexToNumberValidData,
    hexToUtf8InvalidData,
    hexToUtf8ValidData,
    toUtf8ValidData,
    numberToHexInvalidData,
    numberToHexValidData,
    toHexValidData,
    toHexInvalidData,
    toFonsInvalidData,
    toFonsValidData,
    utf8ToHexInvalidData,
    utf8ToHexValidData,
    toCheckSumValidData,
    bytesToUint8ArrayInvalidData,
    bytesToUint8ArrayValidData,
    toBigIntValidData,
    toBigIntInvalidData,
    toCheckSumInvalidData,
    numberToHexstrictValidData,
} from '../fixtures/converters';

describe('converters', () => {
    describe('bytesToHex', () => {
        describe('valid cases', () => {
            it.each(bytesToHexValidData)('%s', (input, output) => {
                expect(bytesToHex(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(bytesToHexInvalidData)('%s', (input, output) => {
                expect(() => bytesToHex(input)).toThrow(output);
            });
        });
    });

    describe('hexToBytes', () => {
        describe('valid cases', () => {
            it.each(hexToBytesValidData)('%s', (input, output) => {
                expect(hexToBytes(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(hexToBytesInvalidData)('%s', (input, output) => {
                expect(() => hexToBytes(input)).toThrow(output);
            });
        });
    });

    describe('numberToHex', () => {
        describe('valid cases', () => {
            it.each(numberToHexValidData)('%s', (input, output) => {
                expect(numberToHex(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(numberToHexInvalidData)('%s', (input, output) => {
                expect(() => numberToHex(input)).toThrow(output);
            });
        });

        describe('valid hexstrict cases', () => {
            it.each(numberToHexstrictValidData)('%s', (input, output) => {
                expect(numberToHex(input, true)).toEqual(output);
            });
        });
    });

    describe('fromDecimal', () => {
        describe('valid cases', () => {
            it.each(numberToHexValidData)('%s', (input, output) => {
                expect(fromDecimal(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(numberToHexInvalidData)('%s', (input, output) => {
                expect(() => fromDecimal(input)).toThrow(output);
            });
        });
    });

    describe('hexToNumber', () => {
        describe('valid cases', () => {
            it.each(hexToNumberValidData)('%s', (input, output) => {
                expect(hexToNumber(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(hexToNumberInvalidData)('%s', (input, output) => {
                expect(() => hexToNumber(input)).toThrow(output);
            });
        });
    });

    describe('toDecimal', () => {
        describe('valid cases', () => {
            it.each(hexToNumberValidData)('%s', (input, output) => {
                expect(toDecimal(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(hexToNumberInvalidData)('%s', (input, output) => {
                expect(() => toDecimal(input)).toThrow(output);
            });
        });
    });

    describe('hexToNumberString', () => {
        it.each(hexToNumberValidData)('%s', (input, output) => {
            expect(hexToNumberString(input)).toEqual(output.toString());
        });
    });

    describe('utf8ToHex', () => {
        describe('valid cases', () => {
            it.each(utf8ToHexValidData)('%s', (input, output) => {
                expect(utf8ToHex(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(utf8ToHexInvalidData)('%s', (input, output) => {
                expect(() => utf8ToHex(input)).toThrow(output);
            });
        });
    });

    describe('fromUtf8', () => {
        describe('valid cases', () => {
            it.each(utf8ToHexValidData)('%s', (input, output) => {
                expect(fromUtf8(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(utf8ToHexInvalidData)('%s', (input, output) => {
                expect(() => fromUtf8(input)).toThrow(output);
            });
        });
    });

    describe('stringToHex', () => {
        describe('valid cases', () => {
            it.each(utf8ToHexValidData)('%s', (input, output) => {
                expect(stringToHex(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(utf8ToHexInvalidData)('%s', (input, output) => {
                expect(() => stringToHex(input)).toThrow(output);
            });
        });
    });

    describe('hexToUtf8', () => {
        describe('valid cases', () => {
            it.each(hexToUtf8ValidData)('%s', (input, output) => {
                expect(hexToUtf8(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(hexToUtf8InvalidData)('%s', (input, output) => {
                expect(() => hexToUtf8(input)).toThrow(output);
            });
        });
    });

    describe('toUtf8', () => {
        describe('valid cases', () => {
            it.each(toUtf8ValidData)('%s', (input, output) => {
                expect(toUtf8(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(hexToUtf8InvalidData)('%s', (input, output) => {
                expect(() => toUtf8(input)).toThrow(output);
            });
        });
    });

    describe('hexToString', () => {
        describe('valid cases', () => {
            it.each(hexToUtf8ValidData)('%s', (input, output) => {
                expect(hexToString(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(hexToUtf8InvalidData)('%s', (input, output) => {
                expect(() => hexToString(input)).toThrow(output);
            });
        });
    });

    describe('asciiToHex', () => {
        describe('valid cases', () => {
            it.each(asciiToHexValidData)('%s', (input, output) => {
                expect(asciiToHex(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(utf8ToHexInvalidData)('%s', (input, output) => {
                expect(() => asciiToHex(input)).toThrow(output);
            });
        });
    });

    describe('fromAscii', () => {
        describe('valid cases', () => {
            it.each(asciiToHexValidData)('%s', (input, output) => {
                expect(fromAscii(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(utf8ToHexInvalidData)('%s', (input, output) => {
                expect(() => fromAscii(input)).toThrow(output);
            });
        });
    });

    describe('hexToAscii', () => {
        describe('valid cases', () => {
            it.each(hexToAsciiValidData)('%s', (input, output) => {
                expect(hexToAscii(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(hexToUtf8InvalidData)('%s', (input, output) => {
                expect(() => hexToAscii(input)).toThrow(output);
            });
        });
    });

    describe('toAscii', () => {
        describe('valid cases', () => {
            it.each(hexToAsciiValidData)('%s', (input, output) => {
                expect(toAscii(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(hexToUtf8InvalidData)('%s', (input, output) => {
                expect(() => toAscii(input)).toThrow(output);
            });
        });
    });

    describe('toHex', () => {
        describe('return value', () => {
            it.each(toHexValidData)('%s', (input, output) => {
                expect(toHex(input)).toEqual(output[0]);
            });
        });

        describe('return type', () => {
            it.each(toHexValidData)('%s', (input, output) => {
                expect(toHex(input, true)).toEqual(output[1]);
            });
        });

        describe('invalid cases', () => {
            it.each(toHexInvalidData)('%s', (input, output) => {
                expect(() => toHex(input)).toThrow(output);
            });
        });
    });

    describe('toNumber', () => {
        it.each([...hexToNumberValidData, [123, 123], ['123', 123]])('%s', (input, output) => {
            expect(toNumber(input)).toEqual(output);
        });
    });

    describe('fromFons', () => {
        describe('valid cases', () => {
            it.each(fromFonsValidData)('%s', (input, output) => {
                expect(fromFons(input[0], input[1])).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(fromFonsInvalidData)('%s', (input, output) => {
                expect(() => fromFons(input[0], input[1])).toThrow(output);
            });
        });
    });

    describe('toFons', () => {
        describe('valid cases', () => {
            it.each(toFonsValidData)('%s', (input, output) => {
                expect(toFons(output, input[1])).toEqual(input[0].toString());
            });
        });

        describe('invalid cases', () => {
            it.each(toFonsInvalidData)('%s', (input, output) => {
                expect(() => toFons(input[0], input[1])).toThrow(output);
            });
        });
    });
    describe('toChecksumAddress', () => {
        describe('valid cases', () => {
            it.each(toCheckSumValidData)('%s', (input, output) => {
                expect(toChecksumAddress(input)).toEqual(output);
            });
        });
        describe('invalid cases', () => {
            it.each(toCheckSumInvalidData)('%s', (input, output) => {
                expect(() => toChecksumAddress(input)).toThrow(output);
            });
        });
    });
    describe('bytesToUint8Array', () => {
        describe('bytesToUint8Array', () => {
            describe('valid cases', () => {
                it.each(bytesToUint8ArrayValidData)('%s', (input, output) => {
                    expect(bytesToUint8Array(input)).toEqual(output);
                });
            });

            describe('invalid cases', () => {
                it.each(bytesToUint8ArrayInvalidData)('%s', (input, output) => {
                    expect(() => bytesToUint8Array(input)).toThrow(output);
                });
            });
        });
    });
    describe('toBigInt', () => {
        describe('valid cases', () => {
            it.each(toBigIntValidData)('%s', (input, output) => {
                expect(toBigInt(input)).toEqual(output);
            });
        });

        describe('invalid cases', () => {
            it.each(toBigIntInvalidData)('%s', (input, output) => {
                expect(() => toBigInt(input)).toThrow(output);
            });
        });
    });
});
