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
import { WebsocketProvider } from '../../../src';
import { getTestWsServer } from '../e2e_utils';
import { produceBlock } from '../block_fixtures';
import { createJsonRpcRequest } from './websocket_provider.test';
import { SubscriptionEvent } from '@beatoz/web3-types';

describe('WebsocketClient', () => {
    it('delivers block headers until the subscription is cancelled', async () => {
        const client = new WebsocketProvider(getTestWsServer());
        const query = "tm.event='NewBlockHeader'";
        const events: SubscriptionEvent[] = [];
        let failure: Error | undefined;

        const subscription = client.listen(createJsonRpcRequest('subscribe', { query })).subscribe({
            error: (err: Error) => {
                failure = err;
            },
            complete: () => {
                failure = new Error('the subscription completed on its own');
            },
            next: (event: SubscriptionEvent) => {
                events.push(event);
                expect(event.query).toEqual(query);
            },
        });

        // This node only produces empty blocks on a 60s timer, so waiting for
        // headers without causing a block just times out.
        await produceBlock();
        await produceBlock();

        expect(failure).toBeUndefined();
        expect(events.length).toBeGreaterThanOrEqual(2);

        const seenBeforeCancel = events.length;
        subscription.unsubscribe();

        // Nothing should reach a cancelled subscription. A plain wait cannot
        // show that here, because on this chain nothing would arrive anyway.
        await produceBlock();

        expect(events.length).toEqual(seenBeforeCancel);
        expect(failure).toBeUndefined();

        client.disconnect();
    });
});
