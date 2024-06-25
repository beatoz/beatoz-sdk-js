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
import { Socket } from 'net';

import { Web3Error } from './error_types.js';
import { EthExecutionAPI } from './apis/eth_execution_api.js';
import {
    JsonRpcNotification,
    JsonRpcPayload,
    JsonRpcResponse,
    JsonRpcResponseWithError,
    JsonRpcResponseWithResult,
    JsonRpcResult,
    JsonRpcSubscriptionResult,
} from './json_rpc_types.js';
import {
    Web3APISpec,
    Web3APIMethod,
    Web3APIReturnType,
    Web3APIPayload,
    ProviderConnectInfo,
    ProviderRpcError,
    ProviderMessage,
} from './web3_api_types.js';
import { BeatozExecutionAPI } from './apis/beatoz_execution_api.js';
import { Web3DeferredPromiseInterface } from './web3_deferred_promise_type.js';

const symbol = Symbol.for('web3/base-provider');

export interface SocketRequestItem<
    API extends Web3APISpec,
    Method extends Web3APIMethod<API>,
    ResponseType,
> {
    payload: Web3APIPayload<API, Method>;
    deferredPromise: Web3DeferredPromiseInterface<ResponseType>;
}

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#connectivity
export type Web3ProviderStatus = 'connecting' | 'connected' | 'disconnected';

export type Web3ProviderEventCallback<T = JsonRpcResult> = (
    error: Error | ProviderRpcError | undefined,
    result?: JsonRpcSubscriptionResult | JsonRpcNotification<T>,
) => void;

export type Web3ProviderMessageEventCallback<T = JsonRpcResult> = (
    result?: JsonRpcSubscriptionResult | JsonRpcNotification<T>,
) => void;

export type Web3Eip1193ProviderEventCallback<T> = (data: T) => void;

export type Web3ProviderRequestCallback<ResultType = unknown> = (
    // Used "null" value to match the legacy version
    // eslint-disable-next-line @typescript-eslint/ban-types
    err?: Error | Web3Error | null | JsonRpcResponseWithError<Error>,
    response?: JsonRpcResponseWithResult<ResultType>,
) => void;

export interface LegacySendProvider {
    send<R = JsonRpcResult, P = unknown>(
        payload: JsonRpcPayload<P>,
        // Used "null" value to match the legacy version
        // eslint-disable-next-line @typescript-eslint/ban-types
        callback: (err: Error | null, response?: JsonRpcResponse<R>) => void,
    ): void;
}

export interface LegacySendAsyncProvider {
    sendAsync<R = JsonRpcResult, P = unknown>(
        payload: JsonRpcPayload<P>,
    ): Promise<JsonRpcResponse<R>>;
}

export interface LegacyRequestProvider {
    request<R = JsonRpcResult, P = unknown>(
        payload: JsonRpcPayload<P>,
        // eslint-disable-next-line @typescript-eslint/ban-types
        callback: (err: Error | null, response: JsonRpcResponse<R>) => void,
    ): void;
}

export interface SimpleProvider<API extends Web3APISpec> {
    request<Method extends Web3APIMethod<API>, ResponseType = Web3APIReturnType<API, Method>>(
        args: Web3APIPayload<API, Method>,
    ): Promise<JsonRpcResponseWithResult<ResponseType> | unknown>;
}

export interface ProviderInfo {
    chainId: string;
}

export type ProviderChainId = string;

export type ProviderAccounts = string[];

export type Eip1193EventName =
    | 'connect'
    | 'disconnect'
    | 'message'
    | 'chainChanged'
    | 'accountsChanged';

export interface EIP1193Provider<API extends Web3APISpec> extends SimpleProvider<API> {
    on(event: 'connect', listener: (info: ProviderInfo) => void): void;
    on(event: 'disconnect', listener: (error: ProviderRpcError) => void): void;
    on(event: 'message', listener: (message: ProviderMessage) => void): void;
    on(event: 'chainChanged', listener: (chainId: ProviderChainId) => void): void;
    on(event: 'accountsChanged', listener: (accounts: ProviderAccounts) => void): void;

    removeListener(event: 'connect', listener: (info: ProviderInfo) => void): void;
    removeListener(event: 'disconnect', listener: (error: ProviderRpcError) => void): void;
    removeListener(event: 'message', listener: (message: ProviderMessage) => void): void;
    removeListener(event: 'chainChanged', listener: (chainId: ProviderChainId) => void): void;
    removeListener(event: 'accountsChanged', listener: (accounts: ProviderAccounts) => void): void;
}

// Provider interface compatible with EIP-1193
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md
export abstract class Web3BaseProvider<API extends Web3APISpec = EthExecutionAPI>
    implements LegacySendProvider, LegacySendAsyncProvider, EIP1193Provider<API>
{
    public static isWeb3Provider(provider: unknown) {
        return (
            provider instanceof Web3BaseProvider ||
            Boolean(provider && (provider as { [symbol]: boolean })[symbol])
        );
    }

    // To match an object "instanceof" does not work if
    // matcher class and object is using different package versions
    // to overcome this bottleneck used this approach.
    // The symbol value for one string will always remain same regardless of package versions
    // eslint-disable-next-line class-methods-use-this
    public get [symbol]() {
        return true;
    }

    public abstract getStatus(): Web3ProviderStatus;
    public abstract supportsSubscriptions(): boolean;

    /**
     * @deprecated Please use `.request` instead.
     * @param payload - Request Payload
     * @param callback - Callback
     */
    public send<ResultType = JsonRpcResult, P = unknown>(
        payload: JsonRpcPayload<P>,
        // eslint-disable-next-line @typescript-eslint/ban-types
        callback: (err: Error | null, response?: JsonRpcResponse<ResultType>) => void,
    ) {
        this.request<Web3APIMethod<API>, ResultType>(
            payload as Web3APIPayload<API, Web3APIMethod<API>>,
        )
            .then((response) => {
                // eslint-disable-next-line no-null/no-null
                callback(null, response);
            })
            .catch((err: Error | Web3Error) => {
                callback(err);
            });
    }

    /**
     * @deprecated Please use `.request` instead.
     * @param payload - Request Payload
     */
    public async sendAsync<R = JsonRpcResult, P = unknown>(payload: JsonRpcPayload<P>) {
        return this.request(payload as Web3APIPayload<API, Web3APIMethod<API>>) as Promise<
            JsonRpcResponse<R>
        >;
    }

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#request
    public abstract request<
        Method extends Web3APIMethod<API>,
        ResultType = Web3APIReturnType<API, Method> | unknown,
    >(args: Web3APIPayload<API, Method>): Promise<JsonRpcResponseWithResult<ResultType>>;

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#events

    public abstract on(
        type: 'disconnect',
        listener: Web3Eip1193ProviderEventCallback<ProviderRpcError>,
    ): void;
    public abstract on<T = JsonRpcResult>(
        type: 'message' | string,
        listener:
            | Web3Eip1193ProviderEventCallback<ProviderMessage>
            | Web3ProviderMessageEventCallback<T>,
    ): void;
    // for old providers
    public abstract on<T = JsonRpcResult>(
        type: 'data' | string,
        listener:
            | Web3Eip1193ProviderEventCallback<ProviderMessage>
            | Web3ProviderMessageEventCallback<T>,
    ): void;
    public abstract on(
        type: 'connect',
        listener: Web3Eip1193ProviderEventCallback<ProviderConnectInfo>,
    ): void;
    public abstract on(
        type: 'chainChanged',
        listener: Web3Eip1193ProviderEventCallback<string>,
    ): void;
    public abstract on(
        type: 'accountsChanged',
        listener: Web3Eip1193ProviderEventCallback<string[]>,
    ): void;
    public abstract removeListener(
        type: 'disconnect',
        listener: Web3Eip1193ProviderEventCallback<ProviderRpcError>,
    ): void;
    public abstract removeListener<T = JsonRpcResult>(
        type: 'message' | string,
        listener: Web3Eip1193ProviderEventCallback<ProviderMessage> | Web3ProviderEventCallback<T>,
    ): void;
    public abstract removeListener(
        type: 'connect',
        listener: Web3Eip1193ProviderEventCallback<ProviderConnectInfo>,
    ): void;
    public abstract removeListener(
        type: 'chainChanged',
        listener: Web3Eip1193ProviderEventCallback<string>,
    ): void;
    public abstract removeListener(
        type: 'accountsChanged',
        listener: Web3Eip1193ProviderEventCallback<string[]>,
    ): void;
    public abstract once(
        type: 'disconnect',
        listener: Web3Eip1193ProviderEventCallback<ProviderRpcError>,
    ): void;
    public abstract once<T = JsonRpcResult>(
        type: 'message' | string,
        listener: Web3Eip1193ProviderEventCallback<ProviderMessage> | Web3ProviderEventCallback<T>,
    ): void;
    public abstract once(
        type: 'connect',
        listener: Web3Eip1193ProviderEventCallback<ProviderConnectInfo>,
    ): void;
    public abstract once(
        type: 'chainChanged',
        listener: Web3Eip1193ProviderEventCallback<string>,
    ): void;
    public abstract once(
        type: 'accountsChanged',
        listener: Web3Eip1193ProviderEventCallback<string[]>,
    ): void;
    public abstract removeAllListeners?(type: string): void;
    public abstract connect(): void;
    public abstract disconnect(code?: number, data?: string): void;
    public abstract reset(): void;
}

export type SupportedProviders<API extends Web3APISpec = BeatozExecutionAPI> =
    | EIP1193Provider<API>
    | Web3BaseProvider<API>
    | LegacyRequestProvider
    | LegacySendProvider
    | LegacySendAsyncProvider
    | SimpleProvider<API>;

export type Web3BaseProviderConstructor = new <API extends Web3APISpec>(
    url: string,
    net?: Socket,
) => Web3BaseProvider<API>;
