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
import { getDevWsServer, getDevAccountPrivateKey, getDevAccountAddress } from './e2e_utils';
import { WebsocketProvider } from '@beatoz/web3-providers-ws';
import { BroadcastTxCommitResponse, VmCallResponse } from '@beatoz/web3-types';
import { decodeParameter } from '@beatoz/web3-abi';
import { Web3 } from '@beatoz/web3';

describe('transfer test', () => {
    const web3 = new Web3(getDevWsServer());
    web3.beatoz.accounts.wallet.add(getDevAccountPrivateKey())
    it('transfer function', (done) => {
        
        const fromAcct = web3.beatoz.accounts.wallet.get(getDevAccountAddress())
        if (fromAcct === undefined) {
            console.error(`not found wallet of ${getDevAccountAddress()}`)
            done();
        }

        const erc20Contract = new web3.beatoz.Contract(
            erc20Json,
            '0x10f19a005a0cadb8b46af4ae0fea8cafdeeffe3d',
        ) as any;
        // erc20Contract.setProvider(new WebsocketProvider(getDevWsServer()));

        erc20Contract.methods
            .transfer('0x0000000000000000000000000000000000000001', '1000')
            .broadcast({from: fromAcct!.address, gas:"250000"})
            .then((res:BroadcastTxCommitResponse) => {
                console.log('response', res);

                if (res.check_tx.code == 0 && res.deliver_tx?.code == 0) {
                    erc20Contract.methods.balanceOf('0x0000000000000000000000000000000000000001')
                    .call()
                    .then( (resp: VmCallResponse) => {
                        console.log('response', resp);
                        const hexBalance = `0x${resp.value.returnData ?? "00"}`;
                        console.log('balance', decodeParameter('uint', hexBalance));
                        done();
                    })
                }
            });
    });
});