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
    let defaultWeb3: Web3;

    beforeAll(() => {
        defaultWeb3 = new Web3();
        defaultWeb3.setProvider(getTestWsServer());
    });

    it('should call web3 setProvider success ', async () => {
        const websocketStatusResponse: StatusResponse = await defaultWeb3.beatoz.status();
        expect(websocketStatusResponse.node_info.network).toEqual('testnet');
        expect(websocketStatusResponse.validator_info.pub_key.type).toEqual(
            'tendermint/PubKeyEd25519',
        );
    });

    it('should call not provider web3 is need fail ', (done) => {
        defaultWeb3.beatoz
            .status()
            .then(() => {
                fail();
            })
            .catch(() => {
                done();
            });
    });
});
