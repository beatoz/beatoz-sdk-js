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
import { sha3Raw } from '@beatoz/web3-utils';
import { AbiError } from '@beatoz/web3-errors';
import { AbiEventFragment } from '@beatoz/web3-types';
import { jsonInterfaceMethodToString, isAbiEventFragment } from '../utils.js';

export const encodeEventSignature = (functionName: string | AbiEventFragment): string => {
    if (typeof functionName !== 'string' && !isAbiEventFragment(functionName)) {
        throw new AbiError('Invalid parameter value in encodeEventSignature');
    }

    let name: string;

    if (functionName && (typeof functionName === 'function' || typeof functionName === 'object')) {
        name = jsonInterfaceMethodToString(functionName);
    } else {
        name = functionName as string;
    }

    return sha3Raw(name);
};
