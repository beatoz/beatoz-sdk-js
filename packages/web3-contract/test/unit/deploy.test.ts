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

import tokenJson from '../fixtures/erc20-contract.json';
import Providers from '../../../../.providers.json';
const { DEVNET0: devnet0 } = Providers;
import { Contract } from '../../src';
import WebsocketProvider from '@beatoz/web3-providers-ws';
import { Web3Account } from '@beatoz/web3-accounts';
import { BytesUint8Array } from '@beatoz/web3-types';
import { Web3 } from '@beatoz/web3';
import fs from 'fs';
import path from 'path';
describe('deploy test', () => {
    const web3 = new Web3(devnet0.WS);
    for(const acct of devnet0.ACCTS) {
        web3.beatoz.accounts.wallet.add(acct.KEY);
    }
    it('deploy function', (done) => {
        const erc20Contract = new Contract(tokenJson.abi);
        erc20Contract.setProvider(new WebsocketProvider(devnet0.WS));

        const web3account: Web3Account = web3.beatoz.accounts.wallet.get(devnet0.ACCTS[0].ADDR)!;

        erc20Contract
            .deploy(tokenJson.bytecode, ['BeatozToken', 'RGT'], web3account, devnet0.CHAINID, 10000000)
            .send()
            .then((res) => {
                console.log(res);
                const data = res?.deliver_tx?.data;
                if (typeof data === 'string') {
                    let contAddr = BytesUint8Array.b64ToBytes(data).toHex();
                    // JSON 파일 생성
                    const contractInfo = {
                        chainId: devnet0.CHAINID,
                        address: contAddr,
                        deployer: web3account.address,
                        time: new Date().toISOString()
                    };
                    
                    fs.writeFileSync(path.join(__dirname, '../fixtures/deployed.contract.json'), JSON.stringify(contractInfo, null, 2));
                    console.log("Contract info saved to deployed-contract.json at ../fixtures/");
                    
                    done();
                } else {
                    done(new Error('deliver_tx.data is undefined or not a string'));
                }
            })
            .catch((err) => {
                console.log(err);
                done(err);
            });
    });
});
