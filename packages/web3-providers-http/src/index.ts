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

import fetch from 'cross-fetch';

import { HttpProviderOptions } from './types.js';

export { HttpProviderOptions } from './types.js';

import {
    JsonRpcResponseWithResult,
    Web3APIMethod,
    Web3APIReturnType,
    Web3APISpec,
    BeatozExecutionAPI,
    Web3APIPayload,
} from '@beatoz/web3-types';
import { ResponseError } from '@beatoz/web3-errors';

export default class HttpProvider<API extends Web3APISpec = BeatozExecutionAPI> {
    private readonly clientUrl: string;
    private readonly httpProviderOptions: HttpProviderOptions | undefined;
    public constructor(clientUrl: string, httpProviderOptions?: HttpProviderOptions) {
        this.clientUrl = clientUrl;
        this.httpProviderOptions = httpProviderOptions;
    }

    public async request<
        Method extends Web3APIMethod<API>,
        ResponseType = Web3APIReturnType<API, Method>,
    >(
        payload: Web3APIPayload<API, Method>,
        requestOptions?: RequestInit,
    ): Promise<JsonRpcResponseWithResult<ResponseType>> {
        const providerOptionsCombined = {
            ...this.httpProviderOptions?.providerOptions,
            ...requestOptions,
        };

        const response = await fetch(this.clientUrl, {
            ...providerOptionsCombined,
            method: 'POST',
            headers: {
                ...providerOptionsCombined.headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (!response.ok) throw new ResponseError(await response.json());

        return (await response.json()) as JsonRpcResponseWithResult<ResponseType>;
    }

    public getClientUrl(): string {
        return this.clientUrl;
    }
}

export { HttpProvider };
