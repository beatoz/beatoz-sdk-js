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
import { getTestWsServer } from '../e2e_utils';
import { AbciInfoResponse } from '@beatoz/web3-types';

describe('abciInfo check ', () => {
    let web3: Web3;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
    });

    it('should call web3 with testWebsocketWeb3Instance.abciInfo method success return', async () => {
        const websocketAbciInfoResponse: AbciInfoResponse = await web3.beatoz.abciInfo();
        expect(websocketAbciInfoResponse.response.version).toBeDefined();
        expect(websocketAbciInfoResponse.response.app_version).toBeDefined();
        expect(websocketAbciInfoResponse.response.last_block_height).toBeGreaterThan(0);
        expect(websocketAbciInfoResponse.response.last_block_app_hash).toBeDefined();
    });
});