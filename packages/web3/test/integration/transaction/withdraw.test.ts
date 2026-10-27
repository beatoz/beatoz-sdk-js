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
    getTestWsServer,
} from '../e2e_utils';
import {
    privateKeyToAccount,
    TrxPayloadWithdrawProto,
    TrxProtoBuilder,
    Web3Account,
} from '@beatoz/web3-accounts';

// The test node cannot pay out a withdrawable reward in a test's lifetime:
// inflation rewards are issued every inflationCycleBlocks (10080), and fee
// rewards go straight to the proposer's balance. So these tests check what
// can be checked against it - that the node decodes the transaction and
// accepts its signature - and leave the payout itself untested.
//
// The node verifies the signature when it builds the transaction context,
// before it looks at the reward ledger. A rejection for a missing reward
// therefore means decoding and signature verification both passed.

describe('withdraw test', () => {
    let web3: Web3;
    let account: Web3Account;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
        account = privateKeyToAccount(getTestAccountPrivateKey()) as Web3Account;
    });

    afterAll(() => closeProvider(web3));

    const build = async (reqAmt: string) => {
        const { value: rule } = await web3.beatoz.rule();
        const { value: sender } = await web3.beatoz.getAccount(account.address);
        return TrxProtoBuilder.buildWithdrawTrx({
            from: account.address,
            to: account.address,
            amount: '0',
            nonce: sender.nonce,
            gas: Number(rule.minTrxGas),
            gasPrice: String(rule.gasPrice),
            payload: { reqAmt },
        });
    };

    it('reaches the reward check, so the node decoded it and accepted the signature', async () => {
        const { value: ledger } = await web3.beatoz.reward(account.address);
        expect(ledger.cumulated).toEqual('0');

        const tx = await build('1');
        TrxProtoBuilder.signTrxProto(tx, account, getTestChainId());
        const result = await web3.beatoz.checkTx(tx);

        expect(result.code).not.toEqual(0);
        expect(result.log).toContain('not found result');
        expect(result.log).not.toMatch(/signature|proto:/i);
    });

    it('control: a non-minimal ReqAmt is signed over bytes the node does not rebuild', async () => {
        const tx = await build('1');
        // 0x0001 is the same number as 0x01, but the node re-encodes it as
        // 0x01, so the preimage it checks the signature against differs.
        tx.Payload = TrxPayloadWithdrawProto.encode({
            ReqAmt: new Uint8Array([0x00, 0x01]),
        }).finish();
        TrxProtoBuilder.signTrxProto(tx, account, getTestChainId());
        const result = await web3.beatoz.checkTx(tx);

        expect(result.code).not.toEqual(0);
        expect(result.log).toMatch(/signature/i);
    });
});
