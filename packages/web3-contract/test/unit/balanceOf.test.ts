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
import { VmCallResponse } from '@beatoz/web3-types';
import { Contract } from '../../src';
import erc20Json from '../fixtures/erc20-abi.json';
import { getDevWsServer } from './e2e_utils';
import WebsocketProvider from '@beatoz/web3-providers-ws';

describe('deploy test', () => {
    it('balanceOf function', (done) => {
        const erc20Contract = new Contract(
            erc20Json,
            '0x10f19a005a0cadb8b46af4ae0fea8cafdeeffe3d',
        ) as any;

        erc20Contract.setProvider(new WebsocketProvider(getDevWsServer()));
        erc20Contract.methods
            .balanceOf('0x8576FC0F3AA066FD8880863CF5A6B632A8DDE209')
            .call()
            .then((resp: VmCallResponse) => {
                console.log('resp', resp);
                done();
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
