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
import { Web3 } from '../../../src';
import { getTestAccountAddress, getTestAccountPrivateKey, getTestWsServer } from '../e2e_utils';
import { privateKeyToAccount, TrxProtoBuilder } from '@beatoz/web3-accounts';
import { TrxProto } from '@beatoz/web3-types';

describe('check accounts methods', () => {
    let web3: Web3;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
    });
    it('test account creation and import private key', async () => {
        const web3Account = web3.beatoz.accounts.create();
        expect(web3Account.address.length > 0).toBeTruthy();

        const testAccount = web3.beatoz.accounts.privateKeyToAccount(getTestAccountPrivateKey());
        expect(
            testAccount.address.toLowerCase() === getTestAccountAddress().toLowerCase(),
        ).toBeTruthy();
    });

    it('test sign transaction', async () => {
        const account = privateKeyToAccount(getTestAccountPrivateKey());
        const trxProto: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
            from: account.address,
            nonce: 0,
            to: account.address,
            amount: '1',
            gas: 1000000,
            gasPrice: '250000000000',
        });
        account.signTransaction(trxProto, 'testnet');
        expect(TrxProtoBuilder.verifyTrxProto(trxProto, account, 'testnet')).toBeTruthy();
    });
});
