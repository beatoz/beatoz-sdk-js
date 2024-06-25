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
import { Web3, StatusResponse } from '../../../src';
import { getTestWsServer } from '../e2e_utils';

describe('setProvider check ', () => {
    let web3_1: Web3;
    let web3_2: Web3;

    beforeAll(() => {
        web3_1 = new Web3(getTestWsServer());
        web3_2 = new Web3(getTestWsServer());
    });

    it('should call web3_1 & web3_1 call status success ', async () => {
        console.log('web3_1', web3_1);
        console.log('web3_2', web3_2);

        const websocketStatusResponse1: StatusResponse = await web3_1.beatoz.status();
        console.log('websocketStatusResponse1', websocketStatusResponse1);

        const websocketStatusResponse2: StatusResponse = await web3_2.beatoz.status();
        console.log('websocketStatusResponse2', websocketStatusResponse2);
    });
});
