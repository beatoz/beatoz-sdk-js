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
import deployedContract from '../fixtures/deployed.contract.json';
import Providers from '../../../../.providers.json';
const { DEVNET0: devnet0 } = Providers;
import { Contract } from '../../src';
import WebsocketProvider from '@beatoz/web3-providers-ws';
import { VmCallResponse } from '@beatoz/web3-types';
import { decodeParameter } from '@beatoz/web3-abi';

describe('deploy test', () => {
    it('decimals function', (done) => {
        const erc20Contract = new Contract(erc20Json, deployedContract.address) as any;
        erc20Contract.setProvider(new WebsocketProvider(devnet0.WS));

        erc20Contract.methods
            .decimals()
            .call()
            .then((resp: VmCallResponse) => {
                const decimals = decodeParameter('uint', resp.value.returnData);
                console.log('decimals', decimals);
                done();
            });
    });
});
