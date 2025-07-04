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

import {
    create,
    privateKeyToAccount,
    privateKeyToPrvKey,
    prvKeyToAccount,
    sign,
    signTransaction,
    Wallet,
    Web3Account,
} from '@beatoz/web3-accounts';
import { KeyStore } from '@beatoz/web3-types';

export const initAccountsForContext = () => {
    const decryptWithContext = async (
		keystore: KeyStore | string,
		password: string,
		options?: Record<string, unknown>,
	) => {
		throw new Error('Not supported yet');
	};


    const wallet: Wallet = new Wallet( {
        create: create, //createWithContext,
		privateKeyToAccount: privateKeyToAccount, //privateKeyToAccountWithContext,
		decrypt: decryptWithContext,
    });

    return {
        create: create,
        privateKeyToAccount: privateKeyToAccount,
        privateKeyToPrvKey: privateKeyToPrvKey,
        prvKeyToAccount: prvKeyToAccount,
        decrypt: decryptWithContext,
        sign: sign,
        signTransaction: signTransaction,
        wallet,
    };
};
