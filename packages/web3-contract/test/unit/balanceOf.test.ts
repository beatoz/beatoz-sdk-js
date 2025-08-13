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
import erc20Json from '../fixtures/erc20-abi.json';
import rep20Json from '../fixtures/REP20.json';
import deployedContract from '../fixtures/deployed.contract.json';
import Providers from '../../../../.providers.json';
const { TESTNET0: netInfo } = Providers;
import { VmCallResponse } from '@beatoz/web3-types';
import { Contract } from '../../src';
import WebsocketProvider from '@beatoz/web3-providers-ws';
import { decodeParameter } from '@beatoz/web3-abi';
describe('balanceOf test', () => {
    it('balanceOf function', (done) => {
        const erc20Contract = new Contract(
            erc20Json,
            deployedContract.address,
        ) as any;

        erc20Contract.setProvider(new WebsocketProvider(netInfo.WS));
        erc20Contract.methods
            .balanceOf(deployedContract.deployer)
            .call()
            .then((resp: VmCallResponse) => {
                console.log('resp', resp);
                const balance = decodeParameter('uint', resp.value.returnData);
                console.log('balance', balance);
                done();
            });
    });
});
