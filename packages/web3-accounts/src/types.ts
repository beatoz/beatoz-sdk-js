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

import { Web3BaseWalletAccount } from '@beatoz/web3-types';
import { PrvKey, PubKey, Transaction } from './tx/tx_types.js';

export type SignTransactionResult = {
    rawTransaction: string;
    transactionHash: string;
};

export type SignTransactionFunction = (
    transaction: Transaction<Object> | Record<string, unknown>,
) => SignTransactionResult;

export interface Web3Account extends Web3BaseWalletAccount {
    address: string;
    prvKey: PrvKey;
    pubKey: PubKey;
}
