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
import { getTestWsServer } from './e2e_utils';
import WebsocketProvider from '@beatoz/web3-providers-ws';

describe('deploy test', () => {
    it('decimals function', (done) => {
        const erc20Contract = new Contract(erc20Json, '10f19a005a0cadb8b46af4ae0fea8cafdeeffe3d');
        erc20Contract.setProvider(new WebsocketProvider(getTestWsServer()));

        erc20Contract.methods
            .decimals()
            .call()
            .then((decimals) => {
                console.log('decimals', decimals);
                done();
            });
    });
});
