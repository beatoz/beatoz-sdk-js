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
import { BroadcastTxCommitResponse, Web3 } from '../../../src';
import { getTestAccountPrivateKey, getTestWsServer } from '../e2e_utils';
import { privateKeyToAccount, Web3Account, TrxProtoBuilder } from '@beatoz/web3-accounts';
import { AccountResponse, BroadcastTxSyncResponse } from '@beatoz/web3-types';

describe('broadcastTxSync check ', () => {
    let testWebsocketWeb3Instance: Web3;

    beforeAll(() => {
        testWebsocketWeb3Instance = new Web3(getTestWsServer());
    });

    it('should call web3 with testWebsocketWeb3Instance.broadcastTxSync() method success return', async () => {
        const secretKey = getTestAccountPrivateKey();
        const web3Account = privateKeyToAccount(secretKey) as Web3Account;
        const accountResponse: AccountResponse = await testWebsocketWeb3Instance.beatoz.getAccount(
            web3Account.address,
        );
        expect(Number(accountResponse.value.balance)).toBeGreaterThan(0);

        const tx = TrxProtoBuilder.buildTransferTrxProto({
            from: web3Account.address,
            nonce: accountResponse.value.nonce,
            to: web3Account.address,
            amount: '1',
            gas: 4000,
            gasPrice: '250000000000',
        });

        const { rawTransaction } = web3Account.signTransaction(tx, 'testnet');

        const broadcastTxCommitResponse: BroadcastTxSyncResponse =
            await testWebsocketWeb3Instance.beatoz.broadcastRawTxSync(rawTransaction);
        expect(broadcastTxCommitResponse.hash).toBeDefined();
    });
});
