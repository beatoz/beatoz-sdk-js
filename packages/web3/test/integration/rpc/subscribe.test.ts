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
import { sendSampleTransfer } from '../chain_fixtures';
import { SubscriptionEvent } from '@beatoz/web3-types';

describe('subscribe check', () => {
    let web3: Web3;

    beforeAll(() => {
        web3 = new Web3(getTestWsServer());
    });

    it('delivers block events until the subscription is cancelled', async () => {
        const query = "tm.event='NewBlockHeader'";
        const events: SubscriptionEvent[] = [];
        let failure: Error | undefined;

        const stream = web3.beatoz.subscribe(query);
        const subscription = stream.subscribe({
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

        // This chain only produces empty blocks on a 60s timer, so a test that
        // waits for blocks without causing any just times out. Each transfer is
        // broadcast with commit, so it returns once its block exists.
        await sendSampleTransfer(web3);
        await sendSampleTransfer(web3);

        expect(failure).toBeUndefined();
        expect(events.length).toBeGreaterThanOrEqual(2);

        const seenBeforeCancel = events.length;
        subscription.unsubscribe();

        // Cause another block. Nothing should reach a cancelled subscription -
        // which is the part a plain wait cannot show, because on this chain
        // nothing would have arrived anyway.
        await sendSampleTransfer(web3);

        expect(events.length).toEqual(seenBeforeCancel);
        expect(failure).toBeUndefined();
    });
});
