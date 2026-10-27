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
import {
    closeProvider,
    getTestAccountPrivateKey,
    getTestChainId,
    getTestProposalAccountPrivateKey,
    getTestWsServer,
} from '../e2e_utils';
import { privateKeyToAccount, TrxProtoBuilder, Web3Account } from '@beatoz/web3-accounts';

// The node checks a signature against bytes it rebuilds, encoding a zero
// amount as no bytes. The builders used to encode zero that way only for the
// exact string '0', so a zero written '00' was signed over [0x00] and refused
// as `invalid signature`. Every spelling of zero now reaches the chain.

describe('zero amount', () => {
    let web3: Web3;
    let sender: Web3Account;
    let recipient: Web3Account;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
        sender = privateKeyToAccount(getTestAccountPrivateKey()) as Web3Account;
        recipient = privateKeyToAccount(getTestProposalAccountPrivateKey()) as Web3Account;
    });

    afterAll(() => closeProvider(web3));

    it.each([['0'], ['00'], ['000']])('commits a transfer of %j', async (amount) => {
        const { value: rule } = await web3.beatoz.rule();
        const { value: from } = await web3.beatoz.getAccount(sender.address);
        const tx = TrxProtoBuilder.buildTransferTrxProto({
            from: sender.address,
            to: recipient.address,
            nonce: from.nonce,
            amount,
            gas: Number(rule.minTrxGas),
            gasPrice: String(rule.gasPrice),
        });
        TrxProtoBuilder.signTrxProto(tx, sender, getTestChainId());

        const result = await web3.beatoz.broadcastTxCommit(tx);

        expect(result.check_tx.log).toEqual('');
        expect(result.check_tx.code).toEqual(0);
        expect(result.deliver_tx?.code).toEqual(0);
    });
});
