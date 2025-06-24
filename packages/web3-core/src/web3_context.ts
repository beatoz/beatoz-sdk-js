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

import { Web3Config } from './web3_config.js';
import { Web3RequestManager } from './web3_request_manager.js';
import { isNullish } from '@beatoz/web3-validator';
import { Web3APISpec, BeatozExecutionAPI, Web3AccountProvider, Web3BaseWalletAccount, Web3BaseWallet } from '@beatoz/web3-types';
import HttpProvider from '@beatoz/web3-providers-http';
import WebsocketProvider from '@beatoz/web3-providers-ws';

// eslint-disable-next-line no-use-before-define
export type Web3ContextConstructor<T extends Web3Context, T2 extends unknown[]> = new (
    ...args: [...extras: T2, context: Web3ContextObject]
) => T;

// To avoid circular dependencies, we need to export type from here.
export type Web3ContextObject<API extends Web3APISpec = BeatozExecutionAPI> = {
    requestManager: Web3RequestManager<API>;
	wallet?: Web3BaseWallet<Web3BaseWalletAccount>;
    accountProvider?: Web3AccountProvider<Web3BaseWalletAccount>;
};

export class Web3Context<API extends Web3APISpec = unknown> extends Web3Config {
    public readonly providers = Web3RequestManager.providers;
    protected _requestManager?: Web3RequestManager<API>;
	protected _accountProvider?: Web3AccountProvider<Web3BaseWalletAccount>;
	protected _wallet?: Web3BaseWallet<Web3BaseWalletAccount>;
    public get requestManager() {
        return this._requestManager!;
    }

    public constructor(providerOrContext?: string) {
        super();
        // If "providerOrContext" is provided as "string" or an objects matching "SupportedProviders" interface
        if (
            isNullish(providerOrContext) ||
            (typeof providerOrContext === 'string' && providerOrContext.trim() !== '')
        ) {
            this._requestManager = new Web3RequestManager(providerOrContext);
            return;
        }
    }

    public use<T extends Web3Context, T2 extends unknown[]>(
        ContextRef: Web3ContextConstructor<T, T2>,
        ...args: [...T2]
    ) {
        const useContext = new ContextRef(
            ...([...args, this.getContextObject()] as unknown as [...T2, Web3ContextObject]),
        );

        useContext._requestManager = this.requestManager;

        return useContext;
    }

	public get wallet() {
		return this._wallet;
	}

	public get accountProvider() {
		return this._accountProvider;
	}

    public set provider(provider: HttpProvider | WebsocketProvider | string | undefined) {
        this.requestManager.setProvider(provider);
    }

    public getContextObject(): Web3ContextObject<API> {
        return {
            requestManager: this.requestManager,
            wallet: this.wallet,
            accountProvider: this.accountProvider
        };
    }

    public getProvider() {
        return this.requestManager.providers;
    }

    public setProvider(provider?: HttpProvider | WebsocketProvider | string): boolean {
        if (typeof provider === 'string') {
            // HTTP
            if (/^http(s)?:\/\//i.test(provider)) {
                this.provider = new HttpProvider(provider);
            }

            // WS
            if (/^ws(s)?:\/\//i.test(provider)) {
                this.provider = new WebsocketProvider(provider);
            }
        }
        this.requestManager.setProvider(provider);
        this.provider = provider;
        return true;
    }
}
