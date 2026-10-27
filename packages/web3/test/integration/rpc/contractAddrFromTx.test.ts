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
import { getTestWsServer, closeProvider } from '../e2e_utils';
import { deploySampleContract } from '../chain_fixtures';

describe('contractAddrFromTx check', () => {
    let web3: Web3;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
    });

    afterAll(() => closeProvider(web3));

    it('reads the address out of a deployment this chain performed', async () => {
        const hash = await deploySampleContract(web3);

        const contractAddr: string = await web3.beatoz.contractAddrFromTx(hash);

        expect(contractAddr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });
});
