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
import { Contract } from '../../src';
import erc20Json from '../fixtures/erc20-abi.json';
import { getDevWsServer, getDevAccountPrivateKey, getDevAccountAddress, getDevChainId } from './e2e_utils';
import { WebsocketProvider } from '@beatoz/web3-providers-ws';
import { TrxProtoBuilder, walletManager } from '@beatoz/web3-accounts';
import { BroadcastTxCommitResponse, TrxProto, VmCallResponse } from '@beatoz/web3-types';
import { decodeParameter } from '@beatoz/web3-abi';
import { getAccount } from '@beatoz/web3-methods';
import { Web3 } from '@beatoz/web3';

describe('transfer toekn test', () => {
    it('transfer function', (done) => {
        walletManager.add(getDevAccountPrivateKey())
        const fromAcct = walletManager.get(getDevAccountAddress())
        if (fromAcct === undefined) {
            console.error(`not found wallet of ${getDevAccountAddress()}`)
            done();
        }

        const erc20Contract = new Contract(
            erc20Json,
            '0xb612e45f15320f4b793bbabfcd00a45be982ac8e',
        ) as any;
        erc20Contract.setProvider(new WebsocketProvider(getDevWsServer()));

        erc20Contract.methods
            .transfer('0x0000000000000000000000000000000000000001', '1000')
            .broadcast({from: fromAcct!.address, gas:"250000"})
            .then((res:BroadcastTxCommitResponse) => {
                console.log('response', res);

                erc20Contract.methods.balanceOf('0x0000000000000000000000000000000000000001')
                    .call()
                    .then( (resp: VmCallResponse) => {
                        console.log('response', resp);
                        const hexBalance = `0x${resp.value.returnData ?? "00"}`;
                        console.log('balance', decodeParameter('uint', hexBalance));
                        done();
                    });
            });
        
    });

    it('transfer coin test (not evm)', async () => {
        const web3 = new Web3(getDevWsServer());

        walletManager.add(getDevAccountPrivateKey())
        const fromAcct = walletManager.get(getDevAccountAddress())
        if (fromAcct === undefined) {
            console.error(`not found wallet of ${getDevAccountAddress()}`);
            return;
        }
        
        const acctInfo = await web3.beatoz.getAccount(fromAcct!.address)
        console.log("acctInfo", acctInfo);

        const tx: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
            from: acctInfo.value.address,
            nonce: acctInfo.value.nonce,
            to: '0x0000000000000000000000000000000000000001',
            amount: '100',
            gas: 1000000,
            gasPrice: '250000000000',
        });

        const { rawTransaction } = fromAcct?.signTransaction(tx, getDevChainId())

        // broadcast raw transaction
        const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
        console.log(result);
    });
});