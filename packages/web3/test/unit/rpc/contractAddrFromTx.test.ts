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
import { getTestAccountPrivateKey, getTestWsServer } from '../e2e_utils';
import tokenJson from '../../fixtures/erc20-contract.json';
import { Contract } from '@beatoz/web3-contract';

describe('contractAddrFromTx check ', () => {
    let web3: Web3;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
    });

    it('Check return value of contractAddrFromTx call', async () => {
        const contractAddr: string = await web3.beatoz.contractAddrFromTx(
            '8612E355C72FBC4034708C1A42CEEE92BB3A0B6D1F5A08D33A393A3D31FE5A08',
        );
        expect(contractAddr).toBe('0xed2701da7141b9ebf456a98cf5d16aa6c9585fe1');
    });
});
