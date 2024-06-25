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
import { CommitResponse } from '@beatoz/web3-types';

describe('commit check ', () => {
    let testWebsocketWeb3Instance: Web3;

    beforeAll(() => {
        testWebsocketWeb3Instance = new Web3(getTestWsServer());
    });

    it('should call web3 with testWebsocketWeb3Instance.commit method success return', async () => {
        const testCommitResponse: CommitResponse = await testWebsocketWeb3Instance.beatoz.commit(
            10000,
        );
        expect(testCommitResponse.signed_header.header.height).toEqual(10000);
        expect(testCommitResponse.signed_header.header.chain_id).toEqual('testnet');
    });
});
