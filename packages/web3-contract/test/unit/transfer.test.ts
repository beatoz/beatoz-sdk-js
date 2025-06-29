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
import { getDevWsServer, getDevAccountPrivateKey, getDevAccountAddress } from './e2e_utils';
import { BroadcastTxCommitResponse, VmCallResponse, ContractAbi, SubscriptionEvent } from '@beatoz/web3-types';
import { decodeParameter } from '@beatoz/web3-abi';
import { Web3, WebsocketProvider } from '@beatoz/web3';
import { numberToHex } from '@beatoz/web3-utils';


const web3 = new Web3(getDevWsServer());
web3.beatoz.accounts.wallet.add(getDevAccountPrivateKey())
describe('transfer test', () => {
    it('transfer function', (done) => {
        
        const fromAcct = web3.beatoz.accounts.wallet.get(getDevAccountAddress())
        if (fromAcct === undefined) {
            console.error(`not found wallet of ${getDevAccountAddress()}`)
            done();
        }

        const erc20Contract = new web3.beatoz.Contract(
            erc20Json,
            '0xc8b0b7e2a0224fb9e2dda6b31316c96edf74391e',
        ) as any;

        erc20Contract.methods
            .transfer('0x0000000000000000000000000000000000000001', '1')
            .broadcast({from: fromAcct!.address, gas:"250000"})
            .then((res:BroadcastTxCommitResponse) => {
                console.log('response', res);

                if (res.check_tx.code == 0 && res.deliver_tx!.code == 0) {
                    erc20Contract.methods.balanceOf('0x0000000000000000000000000000000000000001')
                    .call()
                    .then( (resp: VmCallResponse) => {
                        console.log('response', resp);
                        const hexBalance = `0x${resp.value.returnData ?? "00"}`;
                        console.log('balance', decodeParameter('uint', hexBalance));
                        done();
                    })
                } else {
                    done(res.check_tx.log ?? res.deliver_tx!.log);
                }
            });
    });
});

describe('transfer loop test', () => {
    it('transfer function',  async () => {
        
        const fromAcct = web3.beatoz.accounts.wallet.get(getDevAccountAddress())
        if (fromAcct === undefined) {
            console.error(`not found account of ${getDevAccountAddress()}`)
            return;
        }

        const erc20Contract = new web3.beatoz.Contract(
            erc20Json,
            '0xc8b0b7e2a0224fb9e2dda6b31316c96edf74391e',
        ) as any;


        
        for(let i=0; i<100; i++) {
            const resp = await erc20Contract.methods
                .transfer('0x0000000000000000000000000000000000000001', '1000')
                .broadcast({from: fromAcct.address, gas:"300000", sendMode: "commit"});
            // if (resp.check_tx.code != 0 || resp.deliver_tx?.code != 0) {
            if (resp.check_tx.code != 0 || resp.deliver_tx?.code != 0) {
                console.error(resp);
                break;
            }
            process.stdout.write(`transfer[${i}] txhash:${resp.hash}\n`);
        }
        
    }, 1000 * 60 * 60);
});


describe('transfer sync test', () => {
    it('transfer function',  async () => {
        
        const erc20Contract = new web3.beatoz.Contract(
            erc20Json,
            '0xc8b0b7e2a0224fb9e2dda6b31316c96edf74391e',
        ) as any;

        const eventListener = new Web3(getDevWsServer());
        const stream = eventListener.beatoz.subscribeTx();
        const events: SubscriptionEvent[] = [];
        const subscription = stream.subscribe({
            error: (err) => console.error(err),
            complete: () => console.log('subscription should not complete'),
            next: (event: SubscriptionEvent) => {
                events.push(event);
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
                const txhash = event.events["tx.hash"][0]
                process.stdout.write(`event txhash: ${txhash}\n`);
            },
        });

        process.stdout.write("start transfer tokens\n")

        const fromAcctInfo = await web3.beatoz.getAccount(getDevAccountAddress());
        let nonce = fromAcctInfo.value.nonce


        const mapTxs = new Map();
        for(let i=0; i<100; i++) {
            const resp = await erc20Contract.methods
                .transfer('0x0000000000000000000000000000000000000001', '1000')
                .broadcast({from: getDevAccountAddress(), gas:"300000", nonce: numberToHex(nonce), sendMode: "sync"});
            if (resp.code != 0 ) {
                console.error(resp);
                break;
            }
            mapTxs.set(resp.hash, false);
            process.stdout.write(`transfer[${i}] txhash:${resp.hash}, nonce: ${nonce}\n`);

            nonce = nonce+1;
        }
        
    }, 1000 * 60 * 60);
});