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
import { getTestProposalAccountPrivateKey, getTestWsServer } from '../e2e_utils';
import { privateKeyToAccount, Web3Account, TrxProtoBuilder } from '@beatoz/web3-accounts';

describe('transfer test', () => {
    let web3: Web3;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
    });

    it('transfer', async () => {
        const account = privateKeyToAccount(getTestProposalAccountPrivateKey()) as Web3Account;
        const nonce = (await web3.beatoz.getAccount(account.address)).value.nonce;
        const tx = TrxProtoBuilder.buildTransferTrxProto({
            nonce: nonce,
            from: account.address,
            to: 'fde6b792498effa9095694d722a6fc629a060b11',
            amount: '10',
            gas: 1000000,
            gasPrice: '250000000000',
        });
        TrxProtoBuilder.signTrxProto(tx, account, 'testnet0');
        const result = await web3.beatoz.broadcastTxCommit(tx);
        console.log(result);
    });
});
