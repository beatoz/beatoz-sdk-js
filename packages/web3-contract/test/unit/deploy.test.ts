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
import { Contract } from '../../src';
import tokenJson from '../fixtures/erc20-contract.json';
import { getTestProposalAccountPrivateKey, getTestWsServer } from './e2e_utils';
import WebsocketProvider from '@beatoz/web3-providers-ws';
import { privateKeyToAccount, Web3Account } from '@beatoz/web3-accounts';
import { BytesUint8Array } from '@beatoz/web3-types';

describe('deploy test', () => {
    it('deploy function', (done) => {
        const erc20Contract = new Contract(tokenJson.abi);
        erc20Contract.setProvider(new WebsocketProvider(getTestWsServer()));

        const web3account: Web3Account = privateKeyToAccount(getTestProposalAccountPrivateKey());

        erc20Contract
            .deploy(tokenJson.bytecode, ['BeatozToken', 'RGT'], web3account, 'localnet0', 10000000)
            .send()
            .then((res) => {
                // console.log(res);
                const data = res?.deliver_tx?.data;
                if (typeof data === 'string') {
                    let contAddr = BytesUint8Array.b64ToBytes(data).toHex();
                    console.log("contract address:", contAddr);
                    console.log("deployer address:", web3account.address)
                    done();
                } else {
                    done(new Error('deliver_tx.data is undefined or not a string'));
                }
            })
            .catch((err) => {
                console.log(err);
                done(err);
            })
            });
    });
