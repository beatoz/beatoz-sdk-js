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
import { closeProvider, getTestAccountAddress, getTestServer, getTestWsServer } from '../e2e_utils';
import { asNodeAddress } from '../chain_fixtures';

describe('reward check', () => {
    let web3: Web3;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
    });

    afterAll(() => closeProvider(web3));

    it('returns the reward ledger the node reports for an address', async () => {
        const address = getTestAccountAddress();

        const response = await web3.beatoz.reward(address);

        // Ask the node directly and compare what the ledger says. The query
        // height can move between the two calls, so only the value is compared.
        const raw = await fetch(`${getTestServer()}/reward?addr=0x${asNodeAddress(address)}`);
        const { result } = await raw.json();

        expect(response.key).toEqual(asNodeAddress(address).toUpperCase());
        expect(response.value).toEqual(result.value);
        expect(BigInt(response.value.cumulated)).toBeGreaterThanOrEqual(0n);
    });

    it('accepts an address without the 0x prefix', async () => {
        const address = asNodeAddress(getTestAccountAddress());

        const response = await web3.beatoz.reward(address);

        expect(response.value.address).toEqual(address.toUpperCase());
    });
});
