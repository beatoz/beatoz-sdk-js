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

import { Web3PkgInfo } from './version.js';
import { Web3Context } from '@beatoz/web3-core';
import Web3Method from '@beatoz/web3-methods';
import { isNullish } from '@beatoz/web3-validator';
import { Web3MethodInterface } from './types';
import { initAccountsForContext } from './accounts.js';
import abi from './abi.js';
import { Address, ContractAbi } from '@beatoz/web3-types';
import { Contract } from '@beatoz/web3-contract';
import * as utils from '@beatoz/web3-utils';

export class Web3 extends Web3Context {
    public static version = Web3PkgInfo.version;
    public static utils = utils;

    public static modules = {
        Web3Method,
    };
    public utils: typeof utils;

    public beatoz: Web3MethodInterface;
    public constructor(provider?: string) {
        super(provider);

        if (isNullish(provider) || (typeof provider === 'string' && provider.trim() === '')) {
            console.warn(
                'NOTE: web3.js is running without provider. You need to pass a provider in order to interact with the network!',
            );
        }

        const accounts = initAccountsForContext();

        // Have to use local alias to initiate contract context
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        class ContractBuilder<Abi extends ContractAbi> extends Contract<Abi> {
            constructor(jsonInterface: Abi, addressOrOptionsOrContext?: Address | Web3Context) {
                super(jsonInterface, addressOrOptionsOrContext);
                const providers = self.requestManager.provider;
                super.settingsProvider(providers);
            }
        }

        this.utils = utils;

        const beatoz = self.use(Web3Method);
        //
        // // BEATOZ Module
        this.beatoz = Object.assign(beatoz, {
            accounts,
            Contract: ContractBuilder,
            abi,
        });
    }
}

export default Web3;
