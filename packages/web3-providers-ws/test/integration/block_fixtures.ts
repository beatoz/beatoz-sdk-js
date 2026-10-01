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
    privateKeyToAccount,
    TrxProtoBuilder,
    TrxProtoUtils,
    Web3Account,
} from '@beatoz/web3-accounts';
import { WebsocketProvider } from '../../src';
import {
    getTestAccountAddress,
    getTestChainId,
    getTestProposalAccountPrivateKey,
    getTestServer,
} from './e2e_utils';

const rpc = async (method: string, params: Record<string, unknown>): Promise<any> => {
    const response = await fetch(getTestServer(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const body = await response.json();
    if (body.error) {
        throw new Error(`${method} failed: ${JSON.stringify(body.error)}`);
    }
    return body.result;
};

/**
 * Sends a transfer so the chain produces a block.
 *
 * This node only produces empty blocks on a 60s timer, so a test that waits for
 * block events without causing any just times out. Gas comes from the chain's
 * own rule rather than a constant - it is the node that decides.
 *
 * The transaction goes out over plain HTTP rather than through the websocket
 * under test, so that driving the chain cannot mask a fault in the transport
 * these tests exist to check.
 */
export const produceBlock = async (): Promise<void> => {
    const account = privateKeyToAccount(getTestProposalAccountPrivateKey()) as Web3Account;

    const rule = (await rpc('rule', {})).value;
    const sender = (await rpc('account', { addr: account.address })).value;

    const tx = TrxProtoBuilder.buildTransferTrxProto({
        nonce: sender.nonce,
        from: account.address,
        to: getTestAccountAddress().replace(/^0x/i, ''),
        amount: '10',
        gas: Number(rule.minTrxGas),
        gasPrice: String(rule.gasPrice),
    });
    TrxProtoBuilder.signTrxProto(tx, account, getTestChainId());

    const encoded = Buffer.from(TrxProtoUtils.encode(tx).finish()).toString('base64');
    const result = await rpc('broadcast_tx_commit', { tx: encoded });
    if (result.check_tx?.code !== 0 || result.deliver_tx?.code !== 0) {
        throw new Error(`the node rejected the transfer: ${JSON.stringify(result)}`);
    }
};

export type { WebsocketProvider };
