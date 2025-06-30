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
import { create, privateKeyToAccount } from '../../src';
import { Web3Account } from '../../src/types';

describe('account.ts class test', () => {
    it('create func test && privateKeyToAccount Equal', () => {
        const account: Web3Account = create();
        console.log("private key", account.privateKey);
        console.log("address    ", account.address);

        const account2: Web3Account = privateKeyToAccount(account.privateKey);

        expect(account.address).toEqual(account2.address);
        expect(account.privateKey).toEqual(account2.privateKey);
    });

    it('ethereum compatible address test', () => {
        const privateKey = "2926cd769094b2755d84b74b9180811adf71d9a1bfacf86f81dbfcfd4b9da163";
        const expectedAddr:string = "334B4F940D938839c59094714A239a05dB84FdBe";

        const account: Web3Account = privateKeyToAccount(privateKey);
        expect(expectedAddr.toUpperCase()).toEqual(account.address.toUpperCase());
    });
});
