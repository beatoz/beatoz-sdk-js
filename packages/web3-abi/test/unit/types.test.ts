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
    Address,
    ContractMethodOutputParameters,
    Bytes,
    MatchPrimitiveType,
    Numbers,
} from '@beatoz/web3-types';
import { expectTypeOf, typecheck } from '@humeris/espresso-shot';

describe('types', () => {
    describe('primitive types', () => {
        describe('bool', () => {
            typecheck('should extend the boolean type', () =>
                expectTypeOf<MatchPrimitiveType<'bool', []>>().toExtend<boolean>(),
            );

            typecheck('should extend the boolean type array', () =>
                expectTypeOf<MatchPrimitiveType<'bool[]', []>>().toExtend<boolean[]>(),
            );

            typecheck('should extend the boolean type fixed array', () =>
                expectTypeOf<MatchPrimitiveType<'bool[3]', []>>().toExtend<
                    [boolean, boolean, boolean]
                >(),
            );
        });

        describe('string', () => {
            typecheck('should extend the string type', () =>
                expectTypeOf<MatchPrimitiveType<'string', []>>().toExtend<string>(),
            );

            typecheck('should extend the string type array', () =>
                expectTypeOf<MatchPrimitiveType<'string[]', []>>().toExtend<string[]>(),
            );

            typecheck('should extend the string type fixed array', () =>
                expectTypeOf<MatchPrimitiveType<'string[3]', []>>().toExtend<
                    [string, string, string]
                >(),
            );
        });

        describe('address', () => {
            typecheck('should extend correct type', () =>
                expectTypeOf<MatchPrimitiveType<'address', []>>().toExtend<Address>(),
            );

            typecheck('should extend the correct type array', () =>
                expectTypeOf<MatchPrimitiveType<'address[]', []>>().toExtend<Address[]>(),
            );

            typecheck('should extend the correct type fixed array', () =>
                expectTypeOf<MatchPrimitiveType<'address[3]', []>>().toExtend<
                    [Address, Address, Address]
                >(),
            );
        });

        describe('bytes', () => {
            typecheck('should extend correct type', () =>
                expectTypeOf<MatchPrimitiveType<'bytes', []>>().toExtend<Bytes>(),
            );

            typecheck('should extend correct type with size', () =>
                expectTypeOf<MatchPrimitiveType<'bytes20', []>>().toExtend<Bytes>(),
            );

            typecheck('should extend the correct type array', () =>
                expectTypeOf<MatchPrimitiveType<'bytes[]', []>>().toExtend<Bytes[]>(),
            );

            typecheck('should extend the correct type fixed array', () =>
                expectTypeOf<MatchPrimitiveType<'bytes[3]', []>>().toExtend<
                    [Bytes, Bytes, Bytes]
                >(),
            );
        });

        describe('uint', () => {
            typecheck('should extend correct type', () =>
                expectTypeOf<MatchPrimitiveType<'uint', []>>().toExtend<Numbers>(),
            );

            typecheck('should extend correct type with size', () =>
                expectTypeOf<MatchPrimitiveType<'uint8', []>>().toExtend<Numbers>(),
            );

            typecheck('should extend correct type with size array', () =>
                expectTypeOf<MatchPrimitiveType<'uint8[]', []>>().toExtend<Numbers[]>(),
            );

            typecheck('should extend the correct type array', () =>
                expectTypeOf<MatchPrimitiveType<'uint[]', []>>().toExtend<Numbers[]>(),
            );

            typecheck('should extend the correct type fixed array', () =>
                expectTypeOf<MatchPrimitiveType<'uint[3]', []>>().toExtend<
                    [Numbers, Numbers, Numbers]
                >(),
            );
        });

        describe('int', () => {
            typecheck('should extend correct type', () =>
                expectTypeOf<MatchPrimitiveType<'int', []>>().toExtend<Numbers>(),
            );

            typecheck('should extend correct type with size', () =>
                expectTypeOf<MatchPrimitiveType<'int8', []>>().toExtend<Numbers>(),
            );

            typecheck('should extend correct type with size array', () =>
                expectTypeOf<MatchPrimitiveType<'int8[]', []>>().toExtend<Numbers[]>(),
            );

            typecheck('should extend the correct type array', () =>
                expectTypeOf<MatchPrimitiveType<'int[]', []>>().toExtend<Numbers[]>(),
            );

            typecheck('should extend the correct type fixed array', () =>
                expectTypeOf<MatchPrimitiveType<'int[3]', []>>().toExtend<
                    [Numbers, Numbers, Numbers]
                >(),
            );
        });

        describe('tuple', () => {
            typecheck('should extend correct type', () =>
                expectTypeOf<
                    MatchPrimitiveType<'tuple', [{ type: 'uint'; name: 'a' }]>
                >().toExtend<{ a: Numbers }>(),
            );

            typecheck('should extend correct type with size array', () =>
                expectTypeOf<
                    MatchPrimitiveType<'tuple[3]', [{ type: 'uint'; name: 'a' }]>
                >().toExtend<[{ a: Numbers }, { a: Numbers }, { a: Numbers }]>(),
            );

            typecheck('should extend the correct type array', () =>
                expectTypeOf<
                    MatchPrimitiveType<'tuple[]', [{ type: 'uint'; name: 'a' }]>
                >().toExtend<{ a: Numbers }[]>(),
            );
        });
    });

    describe('contract', () => {
        describe('outputs', () => {
            typecheck('empty outputs should result in []', () =>
                expectTypeOf<ContractMethodOutputParameters<[]>>().toExtend<void>(),
            );

            typecheck('single outputs should result in that type', () => {
                const abi = [
                    {
                        name: '',
                        type: 'string',
                    },
                ] as const;
                return expectTypeOf<
                    ContractMethodOutputParameters<typeof abi>
                >().toExtend<string>();
            });

            typecheck('multiple outputs should result in object indexed by numbers', () => {
                const abi = [
                    {
                        name: '',
                        type: 'string',
                    },
                    {
                        name: '',
                        type: 'int',
                    },
                ] as const;

                return expectTypeOf<
                    ContractMethodOutputParameters<typeof abi>[0]
                >().toExtend<string>();
            });

            typecheck('multiple outputs should result in object indexed by numbers', () => {
                const abi = [
                    {
                        name: '',
                        type: 'string',
                    },
                    {
                        name: '',
                        type: 'int',
                    },
                ] as const;
                return expectTypeOf<
                    ContractMethodOutputParameters<typeof abi>[1]
                >().toExtend<Numbers>();
            });

            typecheck('multiple outputs should result in object indexed by name', () => {
                const abi = [
                    {
                        name: 'first',
                        type: 'string',
                    },
                    {
                        name: 'second',
                        type: 'int',
                    },
                ] as const;
                return expectTypeOf<
                    ContractMethodOutputParameters<typeof abi>['first']
                >().toExtend<string>();
            });

            typecheck('multiple outputs should result in object indexed by name', () => {
                const abi = [
                    {
                        name: 'first',
                        type: 'string',
                    },
                    {
                        name: 'second',
                        type: 'int',
                    },
                ] as const;
                return expectTypeOf<
                    ContractMethodOutputParameters<typeof abi>['second']
                >().toExtend<Numbers>();
            });

            typecheck('single output should result as in exactly one type', () => {
                const abi = [
                    {
                        name: 'first',
                        type: 'string',
                    },
                ] as const;
                return expectTypeOf<
                    ContractMethodOutputParameters<typeof abi>
                >().toExtend<string>();
            });
        });
    });
});
