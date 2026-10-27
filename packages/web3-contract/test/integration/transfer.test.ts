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
import erc20Json from '../fixtures/erc20-abi.json';
import {
    assertCommitted,
    closeProvider,
    deployTestToken,
    netInfo,
    tokenBalance,
} from './e2e_utils';
import { BroadcastTxSyncResponse, SubscriptionEvent } from '@beatoz/web3-types';
import { Web3 } from '@beatoz/web3';
import { numberToHex } from '@beatoz/web3-utils';

const RECIPIENT = '0x0000000000000000000000000000000000000001';

// One iteration per block when committing, so a hundred of them is a load test
// rather than an integration test. A handful shows the same thing; raise
// BEATOZ_TRANSFER_LOOP to put real volume through it.
const iterations = Number(process.env.BEATOZ_TRANSFER_LOOP ?? 5);

const web3 = new Web3(netInfo.WS);
for (const acct of netInfo.ACCTS) {
    web3.beatoz.accounts.wallet.add(acct.KEY);
}

let erc20Contract: any;
beforeAll(async () => {
    const { address } = await deployTestToken(web3);
    erc20Contract = new web3.beatoz.Contract(erc20Json, address);
});
afterAll(() => closeProvider(web3));

const fromAddress = (): string => web3.beatoz.accounts.wallet.get(netInfo.ACCTS[0].ADDR)!.address;

describe('transfer test', () => {
    it('transfer function', async () => {
        const before = await tokenBalance(erc20Contract, RECIPIENT);

        const res = await erc20Contract.methods
            .transfer(RECIPIENT, '1')
            .broadcast({ from: fromAddress(), gas: '250000' });

        assertCommitted(res);
        expect(await tokenBalance(erc20Contract, RECIPIENT)).toEqual(before + 1n);
    });
});

describe('transfer loop test', () => {
    it(
        'transfer loop function',
        async () => {
            const before = await tokenBalance(erc20Contract, RECIPIENT);

            for (let i = 0; i < iterations; i++) {
                const res = await erc20Contract.methods
                    .transfer(RECIPIENT, '1000')
                    .broadcast({ from: fromAddress(), gas: '300000', sendMode: 'commit' });
                assertCommitted(res);
            }

            expect(await tokenBalance(erc20Contract, RECIPIENT)).toEqual(
                before + BigInt(iterations) * 1000n,
            );
        },
        1000 * 60 * 5,
    );
});

describe('transfer sync test', () => {
    it(
        'transfer sync function',
        (done) => {
            const eventListener = new Web3(netInfo.WS);
            const stream = eventListener.beatoz.subscribeTx();
            const mapTxs = new Map<string, boolean>();
            // const events: SubscriptionEvent[] = [];
            // let evtSize = 0;
            const subscription = stream.subscribe({
                error: (err) => console.error(err),
                complete: () => console.log('subscription should not complete'),
                next: (event: SubscriptionEvent) => {
                    // events.push(event);
                    //expect(event.query).toEqual(query);
                    // if (events.length === 2) {
                    //     // make sure they are consecutive heights
                    //     subscription.unsubscribe();

                    //     // wait 1.5 * blockTime and check we did not get more events
                    //     setTimeout(() => {
                    //         expect(events.length).toEqual(2);
                    //         done();
                    //     }, 1.5 * blockTime);
                    // }

                    // const jsonEvt = JSON.stringify(event, null, 2);
                    // console.log(jsonEvt);

                    const txhash = event.events['tx.hash'][0];
                    mapTxs.set(txhash, true);
                    let completed = 0;
                    for (const [, val] of mapTxs) {
                        if (val) {
                            completed++;
                        }
                    }
                    // process.stdout.write(`\revents: ${txhash}`);
                    process.stdout.write(`\r\t\t\t\treceived events: ${completed}`);
                    if (mapTxs.size === completed) {
                        process.stdout.write(
                            `\nFor ${mapTxs.size} txs, ${completed} events has been received.\n`,
                        );
                        subscription.unsubscribe();
                        closeProvider(eventListener);
                        done();
                    }
                },
            });

            const fromAcct = web3.beatoz.accounts.wallet.get(netInfo.ACCTS[0].ADDR)!;
            web3.beatoz.getAccount(fromAcct.address).then((resp) => {
                let nonce = resp.value.nonce;

                for (let i = 0; i < iterations; i++) {
                    erc20Contract.methods
                        .transfer('0x0000000000000000000000000000000000000001', '1000')
                        .broadcast({
                            from: fromAcct.address,
                            gas: '300000',
                            nonce: numberToHex(nonce),
                            sendMode: 'sync',
                        })
                        .then((resp: BroadcastTxSyncResponse) => {
                            if (resp.code != 0) {
                                console.error(resp);
                            }
                            mapTxs.set(resp.hash, false);
                            // process.stdout.write(`\rtransfer[${i}] txhash:${resp.hash}, nonce: ${nonce}`);
                            process.stdout.write(`\rtransfer txs: ${mapTxs.size}`);
                        });

                    nonce = nonce + 1;
                }
            });
        },
        1000 * 60 * 5,
    );
});
