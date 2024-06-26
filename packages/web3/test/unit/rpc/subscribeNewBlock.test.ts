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
import { SubscriptionEvent } from '@beatoz/web3-types';

describe('subscribeTx check ', () => {
    const blockTime = 1000;
    let testWebsocketWeb3Instance: Web3;

    beforeAll(() => {
        testWebsocketWeb3Instance = new Web3(getTestWsServer());
    });

    it('can listen to subscribeTx', (done) => {
        const headers = testWebsocketWeb3Instance.beatoz.subscribeNewBlock();
        const events: SubscriptionEvent[] = [];
        const subscription = headers.subscribe({
            error: done.fail,
            complete: () => done.fail('subscription should not complete'),
            next: (event: SubscriptionEvent) => {
                events.push(event);
                if (events.length === 2) {
                    // make sure they are consecutive heights
                    subscription.unsubscribe();

                    // wait 1.5 * blockTime and check we did not get more events
                    setTimeout(() => {
                        expect(events.length).toEqual(2);
                        done();
                    }, 1.5 * blockTime);
                }
            },
        });
    });
});
