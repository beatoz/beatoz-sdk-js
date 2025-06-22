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
import { walletManager } from '@beatoz/web3-accounts';
import { BroadcastTxCommitResponse, VmCallResponse } from '@beatoz/web3-types';
import { decodeParameter } from '@beatoz/web3-abi';

describe('transfer test', () => {
    it('transfer function', (done) => {
        walletManager.add(getDevAccountPrivateKey())
        const fromAcct = walletManager.get(getDevAccountAddress())
        if (fromAcct === undefined) {
            console.error(`not found wallet of ${getDevAccountAddress()}`)
            done();
        }

        const erc20Contract = new Contract(
            erc20Json,
            '0x4e4a3260d21f2d95e6b3e9176b6b91f5135168a7',
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
                    })
            });
        
    });

    // it('web3 balanceOf function', (done) => {
    //     let web3Contract = new Web3Contract(erc20Json, '4b007901049a210f8e1ce8f4d4ab8e6e1efd1b10');
    //     web3Contract.setProvider(new WebsocketProvider(getTestWsServer()));
    //     web3Contract.methods
    //         .balanceOf('736A9F6FA280A88599DC7FCD24E42975DA89A5AE')
    //         .call()
    //         .then((balance) => {
    //             console.log('balance', balance);
    //             done();
    //         });
    // });
});