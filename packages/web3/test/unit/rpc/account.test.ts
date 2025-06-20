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
import { getTestAccountAddress, getTestWsServer } from '../e2e_utils';
import { AccountResponse } from '@beatoz/web3-types';

describe('account check ', () => {
    let web3: Web3;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
    });

    it('should call web3 with testWebsocketWeb3Instance.account method success return', async () => {
        const testAccountAddress = getTestAccountAddress();
        const testAccountResponse: AccountResponse =
            await web3.beatoz.getAccount(testAccountAddress);

        expect(testAccountResponse.key.toLowerCase()).toEqual(testAccountAddress.toLowerCase());
        expect(testAccountResponse.value.address.toLowerCase()).toEqual(
            testAccountAddress.toLowerCase(),
        );
        expect(testAccountResponse.value.nonce).toBeDefined();
        expect(testAccountResponse.value.balance).toBeDefined();
    });
});
