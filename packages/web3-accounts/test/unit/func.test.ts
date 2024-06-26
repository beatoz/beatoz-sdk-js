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
import { create, privateKeyToAccount } from '../../src';
import { Web3Account } from '../../src/types';
import { getTestProposalAccountPrivateKey } from './e2e_utils';

describe('account.ts class test', () => {
    it('create func test && privateKeyToAccount Equal', () => {
        const account: Web3Account = create();
        console.log(account.address);
        console.log(account.privateKey);

        const account2: Web3Account = privateKeyToAccount(account.privateKey);

        expect(account.address).toEqual(account2.address);
        expect(account.privateKey).toEqual(account2.privateKey);
    });

    it('getTestProposalAccountPrivateKey account test', () => {
        const proposalAccount: Web3Account = privateKeyToAccount(
            getTestProposalAccountPrivateKey(),
        );

        console.log('proposalAccount.address', proposalAccount.address);
    });
});
