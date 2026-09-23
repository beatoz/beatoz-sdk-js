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
import { BlockResponse } from '@beatoz/web3-types';

describe('blockchain check ', () => {
    let testWebsocketWeb3Instance: Web3;

    beforeAll(() => {
        testWebsocketWeb3Instance = new Web3(getTestWsServer());
    });

    it('should call web3 with testWebsocketWeb3Instance.block method success return', async () => {
        const testBlockResponse: BlockResponse = await testWebsocketWeb3Instance.beatoz.block(1);
        expect(testBlockResponse.block_id.hash).toBeDefined();
        expect(testBlockResponse.block_id.parts.total > 0).toBe(true);
        expect(testBlockResponse.block.header.height > 0).toBe(true);
    });

    it('should call web3 with testWebsocketWeb3Instance.block(10000) method success return', async () => {
        const test100BlockResponse: BlockResponse =
            await testWebsocketWeb3Instance.beatoz.block(10000);
        expect(test100BlockResponse.block_id.hash).toBeDefined();
        expect(test100BlockResponse.block_id.parts.total > 0).toBe(true);
        expect(test100BlockResponse.block.header.height == 10000).toBe(true);
    });
});
