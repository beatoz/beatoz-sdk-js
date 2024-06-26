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

describe('abi test', () => {
    it('abi json import', async () => {
        const erc20Contract = new Contract(erc20Json, '0x4b007901049a210f8e1ce8f4d4ab8e6e1efd1b10');
        erc20Contract.setProvider(new WebsocketProvider(getTestWsServer()));

        const response = await erc20Contract.methods.decimals().call();

        console.log('response', response);

        expect(1).toEqual(1);
    });
});
