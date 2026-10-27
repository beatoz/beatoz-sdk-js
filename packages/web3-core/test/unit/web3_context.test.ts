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
import WebsocketProvider from '@beatoz/web3-providers-ws';
import { Web3Context } from '../../src/web3_context';

// Stands in for a real socket: constructing one would dial the URL.
jest.mock('@beatoz/web3-providers-ws');

describe('Web3Context.setProvider', () => {
    it('builds one provider for a ws:// URL', () => {
        const context = new Web3Context();

        context.setProvider('ws://localhost:26657/websocket');

        // Each extra instance is a socket nothing holds and nothing can close.
        expect(WebsocketProvider).toHaveBeenCalledTimes(1);
        expect(context.getProvider()).toBe(jest.mocked(WebsocketProvider).mock.instances[0]);
    });
});
