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

import { InvalidBytesError, InvalidNumberError } from '@beatoz/web3-errors';
import { VALID_BEATOZ_BASE_TYPES } from './constants.js';
import {
    FullValidationSchema,
    JsonSchema,
    Schema,
    ShortValidationSchema,
    ValidationSchemaInput,
    ValidInputTypes,
} from './types.js';
import { isAbiParameterSchema } from './validation/abi.js';
import { isHexStrict } from './validation/string.js';
import { Web3ValidatorError } from './errors.js';

const extraTypes = ['hex', 'number', 'blockNumber', 'blockNumberOrTag', 'filter', 'bloom'];

export const parseBaseType = <T = (typeof VALID_BEATOZ_BASE_TYPES)[number]>(
    type: string,
): {
    baseType?: T;
    baseTypeSize: number | undefined;
    arraySizes: number[];
    isArray: boolean;
} => {
    // Remove all empty spaces to avoid any parsing issue.
    let strippedType = type.replace(/ /, '');
    let baseTypeSize: number | undefined;
    let isArray = false;
    let arraySizes: number[] = [];

    if (type.includes('[')) {
        // Extract the array type
        strippedType = strippedType.slice(0, strippedType.indexOf('['));
        // Extract array indexes
        arraySizes = [...type.matchAll(/(?:\[(\d*)\])/g)]
            .map((match) => parseInt(match[1], 10))
            .map((size) => (Number.isNaN(size) ? -1 : size));

        isArray = arraySizes.length > 0;
    }

    if (VALID_BEATOZ_BASE_TYPES.includes(strippedType)) {
        return { baseType: strippedType as unknown as T, isArray, baseTypeSize, arraySizes };
    }

    if (strippedType.startsWith('int')) {
        baseTypeSize = parseInt(strippedType.substring(3), 10);
        strippedType = 'int';
    } else if (strippedType.startsWith('uint')) {
        baseTypeSize = parseInt(type.substring(4), 10);
        strippedType = 'uint';
    } else if (strippedType.startsWith('bytes')) {
        baseTypeSize = parseInt(strippedType.substring(5), 10);
        strippedType = 'bytes';
    } else {
        return { baseType: undefined, isArray: false, baseTypeSize: undefined, arraySizes };
    }

    return { baseType: strippedType as unknown as T, isArray, baseTypeSize, arraySizes };
};

const convertBeatozType = (
    type: string,
    parentSchema: Schema = {},
): { format?: string; required?: boolean } => {
    const typePropertyPresent = Object.keys(parentSchema).includes('type');

    if (typePropertyPresent) {
        throw new Web3ValidatorError([
            {
                keyword: 'beatoz',
                message: 'BEATOZ "beatoz" or "type" can be presented in schema',
                params: { beatoz: type },
                instancePath: '',
                schemaPath: '',
            },
        ]);
    }

    const { baseType, baseTypeSize } = parseBaseType(type);

    if (!baseType && !extraTypes.includes(type)) {
        throw new Web3ValidatorError([
            {
                keyword: 'beatoz',
                message: `BEATOZ data type "${type}" is not valid`,
                params: { beatoz: type },
                instancePath: '',
                schemaPath: '',
            },
        ]);
    }

    if (baseType) {
        if (baseType === 'tuple') {
            throw new Error('"tuple" type is not implemented directly.');
        }
        return { format: `${baseType}${baseTypeSize ?? ''}`, required: true };
    }
    if (type) {
        return { format: type, required: true };
    }

    return {};
};

export const abiSchemaToJsonSchema = (
    abis: ShortValidationSchema | FullValidationSchema,
    level = '/0',
) => {
    const schema: JsonSchema = {
        type: 'array',
        items: [],
        maxItems: abis.length,
        minItems: abis.length,
    };

    for (const [index, abi] of abis.entries()) {
        // eslint-disable-next-line no-nested-ternary
        let abiType!: string;
        let abiName!: string;
        let abiComponents: ShortValidationSchema | FullValidationSchema | undefined = [];

        // If it's a complete Abi Parameter
        // e.g. {name: 'a', type: 'uint'}
        if (isAbiParameterSchema(abi)) {
            abiType = abi.type;
            abiName = abi.name;
            abiComponents = abi.components as FullValidationSchema;
            // If its short form string value e.g. ['uint']
        } else if (typeof abi === 'string') {
            abiType = abi;
            abiName = `${level}/${index}`;

            // If it's provided in short form of tuple e.g. [['uint', 'string']]
        } else if (Array.isArray(abi)) {
            // If its custom tuple e.g. ['tuple[2]', ['uint', 'string']]
            if (
                abi[0] &&
                typeof abi[0] === 'string' &&
                abi[0].startsWith('tuple') &&
                !Array.isArray(abi[0]) &&
                abi[1] &&
                Array.isArray(abi[1])
            ) {
                // eslint-disable-next-line prefer-destructuring
                abiType = abi[0];
                abiName = `${level}/${index}`;
                abiComponents = abi[1] as ReadonlyArray<ShortValidationSchema>;
            } else {
                abiType = 'tuple';
                abiName = `${level}/${index}`;
                abiComponents = abi;
            }
        }

        const { baseType, isArray, arraySizes } = parseBaseType(abiType);

        let childSchema: JsonSchema;
        let lastSchema = schema;
        for (let i = arraySizes.length - 1; i > 0; i -= 1) {
            childSchema = {
                type: 'array',
                items: [],
                maxItems: arraySizes[i],
                minItems: arraySizes[i],
            };

            if (arraySizes[i] < 0) {
                delete childSchema.maxItems;
                delete childSchema.minItems;
            }

            lastSchema.items = childSchema;
            lastSchema = childSchema;
        }

        if (baseType === 'tuple' && !isArray) {
            const nestedTuple = abiSchemaToJsonSchema(abiComponents, abiName);
            nestedTuple.$id = abiName;
            (lastSchema.items as JsonSchema[]).push(nestedTuple);
        } else if (baseType === 'tuple' && isArray) {
            const arraySize = arraySizes[0];
            const item: JsonSchema = {
                $id: abiName,
                type: 'array',
                items: abiSchemaToJsonSchema(abiComponents, abiName),
                maxItems: arraySize,
                minItems: arraySize,
            };

            if (arraySize < 0) {
                delete item.maxItems;
                delete item.minItems;
            }

            (lastSchema.items as JsonSchema[]).push(item);
        } else if (isArray) {
            const arraySize = arraySizes[0];
            const item: JsonSchema = {
                type: 'array',
                $id: abiName,
                items: convertBeatozType(String(baseType)),
                minItems: arraySize,
                maxItems: arraySize,
            };

            if (arraySize < 0) {
                delete item.maxItems;
                delete item.minItems;
            }

            (lastSchema.items as JsonSchema[]).push(item);
        } else if (Array.isArray(lastSchema.items)) {
            // Array of non-tuple items
            lastSchema.items.push({ $id: abiName, ...convertBeatozType(abiType) });
        } else {
            // Nested object
            ((lastSchema.items as JsonSchema).items as JsonSchema[]).push({
                $id: abiName,
                ...convertBeatozType(abiType),
            });
        }
    }

    return schema;
};

export const beatozAbiToJsonSchema = (abis: ValidationSchemaInput) => abiSchemaToJsonSchema(abis);

export const fetchArrayElement = (data: Array<unknown>, level: number): unknown => {
    if (level === 1) {
        return data;
    }

    return fetchArrayElement(data[0] as Array<unknown>, level - 1);
};

export const transformJsonDataToAbiFormat = (
    abis: FullValidationSchema,
    data: ReadonlyArray<unknown> | Record<string, unknown>,
    transformedData?: Array<unknown>,
): Array<unknown> => {
    const newData: Array<unknown> = [];

    for (const [index, abi] of abis.entries()) {
        // eslint-disable-next-line no-nested-ternary
        let abiType!: string;
        let abiName!: string;
        let abiComponents: ShortValidationSchema | FullValidationSchema | undefined = [];

        // If it's a complete Abi Parameter
        // e.g. {name: 'a', type: 'uint'}
        if (isAbiParameterSchema(abi)) {
            abiType = abi.type;
            abiName = abi.name;
            abiComponents = abi.components as FullValidationSchema;
            // If its short form string value e.g. ['uint']
        } else if (typeof abi === 'string') {
            abiType = abi;

            // If it's provided in short form of tuple e.g. [['uint', 'string']]
        } else if (Array.isArray(abi)) {
            // If its custom tuple e.g. ['tuple[2]', ['uint', 'string']]
            if (abi[1] && Array.isArray(abi[1])) {
                abiType = abi[0] as string;
                abiComponents = abi[1] as ReadonlyArray<ShortValidationSchema>;
            } else {
                abiType = 'tuple';
                abiComponents = abi;
            }
        }

        const { baseType, isArray, arraySizes } = parseBaseType(abiType);
        const dataItem = Array.isArray(data)
            ? (data as Array<unknown>)[index]
            : (data as Record<string, unknown>)[abiName];

        if (baseType === 'tuple' && !isArray) {
            newData.push(
                transformJsonDataToAbiFormat(
                    abiComponents as FullValidationSchema,
                    dataItem as Array<unknown>,
                    transformedData,
                ),
            );
        } else if (baseType === 'tuple' && isArray) {
            const tupleData: unknown[] = [];
            for (const tupleItem of dataItem as Array<unknown>) {
                // Nested array
                if (arraySizes.length > 1) {
                    const nestedItems = fetchArrayElement(
                        tupleItem as Array<unknown>,
                        arraySizes.length - 1,
                    );
                    const nestedData: unknown[] = [];

                    for (const nestedItem of nestedItems as Array<unknown>) {
                        nestedData.push(
                            transformJsonDataToAbiFormat(
                                abiComponents as FullValidationSchema,
                                nestedItem as Array<unknown>,
                                transformedData,
                            ),
                        );
                    }
                    tupleData.push(nestedData);
                } else {
                    tupleData.push(
                        transformJsonDataToAbiFormat(
                            abiComponents as FullValidationSchema,
                            tupleItem as Array<unknown>,
                            transformedData,
                        ),
                    );
                }
            }
            newData.push(tupleData);
        } else {
            newData.push(dataItem);
        }
    }

    // Have to reassign before pushing to transformedData
    // eslint-disable-next-line no-param-reassign
    transformedData = transformedData ?? [];
    transformedData.push(...newData);

    return transformedData;
};

/**
 * Code points to int
 */

export const codePointToInt = (codePoint: number): number => {
    if (codePoint >= 48 && codePoint <= 57) {
        /* ['0'..'9'] -> [0..9] */
        return codePoint - 48;
    }

    if (codePoint >= 65 && codePoint <= 70) {
        /* ['A'..'F'] -> [10..15] */
        return codePoint - 55;
    }

    if (codePoint >= 97 && codePoint <= 102) {
        /* ['a'..'f'] -> [10..15] */
        return codePoint - 87;
    }

    throw new Error(`Invalid code point: ${codePoint}`);
};

/**
 * Converts value to it's number representation
 */
export const hexToNumber = (value: string): bigint | number => {
    if (!isHexStrict(value)) {
        throw new Error('Invalid hex string');
    }

    const [negative, hexValue] = value.startsWith('-') ? [true, value.slice(1)] : [false, value];
    const num = BigInt(hexValue);

    if (num > Number.MAX_SAFE_INTEGER) {
        return negative ? -num : num;
    }

    if (num < Number.MIN_SAFE_INTEGER) {
        return num;
    }

    return negative ? -1 * Number(num) : Number(num);
};

/**
 * Converts value to it's hex representation
 */
export const numberToHex = (value: ValidInputTypes): string => {
    if ((typeof value === 'number' || typeof value === 'bigint') && value < 0) {
        return `-0x${value.toString(16).slice(1)}`;
    }

    if ((typeof value === 'number' || typeof value === 'bigint') && value >= 0) {
        return `0x${value.toString(16)}`;
    }

    if (typeof value === 'string' && isHexStrict(value)) {
        const [negative, hex] = value.startsWith('-') ? [true, value.slice(1)] : [false, value];
        const hexValue = hex.split(/^(-)?0(x|X)/).slice(-1)[0];
        return `${negative ? '-' : ''}0x${hexValue.replace(/^0+/, '').toLowerCase()}`;
    }

    if (typeof value === 'string' && !isHexStrict(value)) {
        return numberToHex(BigInt(value));
    }

    throw new InvalidNumberError(value);
};

/**
 * Adds a padding on the left of a string, if value is a integer or bigInt will be converted to a hex string.
 */
export const padLeft = (value: ValidInputTypes, characterAmount: number, sign = '0'): string => {
    if (typeof value === 'string' && !isHexStrict(value)) {
        return value.padStart(characterAmount, sign);
    }

    const hex = typeof value === 'string' && isHexStrict(value) ? value : numberToHex(value);

    const [prefix, hexValue] = hex.startsWith('-') ? ['-0x', hex.slice(3)] : ['0x', hex.slice(2)];

    return `${prefix}${hexValue.padStart(characterAmount, sign)}`;
};

export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
    let hexString = '0x';
    for (const e of uint8Array) {
        const hex = e.toString(16);
        hexString += hex.length === 1 ? `0${hex}` : hex;
    }
    return hexString;
}

export function hexToUint8Array(hex: string): Uint8Array {
    let value;
    if (hex.toLowerCase().startsWith('0x')) {
        value = hex.slice(2);
    } else {
        value = hex;
    }
    if (value.length % 2 !== 0) {
        throw new InvalidBytesError(`hex string has odd length: ${hex}`);
    }
    const bytes = new Uint8Array(Math.ceil(value.length / 2));
    for (let i = 0; i < bytes.length; i += 1) {
        const byte = parseInt(value.substring(i * 2, i * 2 + 2), 16);
        bytes[i] = byte;
    }
    return bytes;
}
