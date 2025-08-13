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
import rep1155Json from '../fixtures/REP1155.json';
import Providers from '../../../../.providers.json';
const { LOCALNET0: netInfo } = Providers;
import { BytesUint8Array } from '@beatoz/web3-types';
import { Web3 } from '@beatoz/web3';
import { Web3Account } from '@beatoz/web3-accounts';
import { WebsocketProvider } from '@beatoz/web3-providers-ws';

describe('estimateGas test', () => {
    const web3 = new Web3(netInfo.HTTP);
    for (const acct of netInfo.ACCTS) {
        web3.beatoz.accounts.wallet.add(acct.KEY);
    }
    it('estimateGas', (done) => {
        async function deploy() {
            const contract = new web3.beatoz.Contract(rep1155Json.abi);
            contract.setProvider(new WebsocketProvider(netInfo.WS));
        
            const resp = await contract
                .deploy(rep1155Json.bytecode, ['http://myurl', deployerAcct.address], deployerAcct, netInfo.CHAINID, 10000000)
                    .send();
            const data = resp?.deliver_tx?.data;
            if (typeof data === 'string') {
                let contAddr = BytesUint8Array.b64ToBytes(data).toHex();
                process.stdout.write(`contract address: ${contAddr}\n`);
                process.stdout.write(`deployer address: ${deployerAcct.address}\n`);
                return contAddr;
            } else {
                console.error(resp?.deliver_tx?.log);
                throw new Error(resp?.deliver_tx?.log);
            }
        }
        
        async function mint() {
            const contAddr = await deploy()!;
        
            const contract = new web3.beatoz.Contract(rep1155Json.abi, contAddr) as any;
            contract.setProvider(new WebsocketProvider(netInfo.WS));
        
        
            // create company
            const rn = Math.floor(Date.now() / 1000);
            const companyName = "Startbugs-" + rn;
            const productName = "eGiftCard-" + rn;
            const tokenIds:Array<number> = Array.from({ length: 2000 }, (v, i) => i + 1);
            const prices:Array<number> = Array.from({ length: 2000 }, (v, i) => 100000);
            const amounts:Array<number> = Array.from({ length: 2000 }, (v, i) => 100);
            process.stdout.write(`company: ${companyName}, product: ${productName}\n`);
        
            // ===== STEP 1: createCompany =====
            process.stdout.write("\ncreateCompany: \n");
            let resp = await contract.methods.createCompany(companyName).broadcast(commitOpt);
            if(resp.check_tx.code != 0 || resp.deliver_tx.code != 0) {
                const retData = Buffer.from(resp.deliver_tx.data??"", 'base64').toString('utf-8');
                throw new Error(`error: ${resp.deliver_tx.log}(${retData})`);
            }
            process.stdout.write("Success\n");
        
            // ===== STEP 2: createProduct =====
            process.stdout.write("\ncreateProduct: \n");
            resp = await contract.methods.createProduct(
                companyName, 
                productName,
                "https://api.example.com/products/starbucks/ecard-20000/", // URI
                "#RWA #giftcard",
                "e-card"
            ).broadcast(commitOpt);
            if(resp.check_tx.code != 0 || resp.deliver_tx.code != 0) {
                const retData = Buffer.from(resp.deliver_tx.data??"", 'base64').toString('utf-8');
                process.stdout.write(`error: ${resp.deliver_tx.log}(${retData})`);
                return;
            }
            process.stdout.write("Success\n");
        
            const batchCnt = 50;
            for (let idx = 0; idx < Math.min(3, tokenIds.length/batchCnt); idx++) {
                // ===== STEP 3: addTokensToProductBatch =====
                process.stdout.write(`\naddTokensToProductBatch: ${tokenIds[idx*batchCnt]} ~ ${tokenIds[idx*batchCnt+batchCnt-1]}\n`);
                
                let tx = contract.methods.addTokensToProductBatch(
                    companyName, 
                    productName, 
                    tokenIds.slice(idx*batchCnt, idx*batchCnt+batchCnt),
                    prices.slice(idx*batchCnt, idx*batchCnt+batchCnt)
                );
                let gasEsti = await tx.estimateGas(commitOpt);
                let resp = await tx.broadcast({...commitOpt, gas: gasEsti.value.usedGas});
                process.stdout.write(`gas estimated:${gasEsti.toString()}, wanted:${resp.deliver_tx.gas_wanted}, used:${resp.deliver_tx.gas_used}\n`);
                if(resp.check_tx.code != 0 || resp.deliver_tx.code != 0) {
                    const retData = Buffer.from(resp.deliver_tx.data??"", 'base64').toString('utf-8');
                    throw new Error(`error:  ${resp?.deliver_tx?.log}, ${retData}`);
                }
                
                // ===== STEP 4: batchMint =====
                process.stdout.write(`\nbatchMint: ${tokenIds[idx*batchCnt]} ~ ${tokenIds[idx*batchCnt+batchCnt-1]}\n`);
                tx = await contract.methods.batchMint(
                    contAddr,
                    tokenIds.slice(idx*batchCnt, idx*batchCnt+batchCnt),
                    amounts.slice(idx*batchCnt, idx*batchCnt+batchCnt),
                    companyName,
                    productName,
                    "0x"
                )
                gasEsti = await tx.estimateGas(commitOpt);
                resp = await tx.broadcast({...commitOpt, gas: gasEsti.value.usedGas});
                process.stdout.write(`gas estimated:${gasEsti.toString()}, wanted:${resp.deliver_tx.gas_wanted}, used:${resp.deliver_tx.gas_used}\n`);
                if(resp.check_tx.code != 0 || resp.deliver_tx.code != 0) {
                    const retData = Buffer.from(resp.deliver_tx.data??"", 'base64').toString('utf-8');
                    throw new Error(`error:  ${resp?.deliver_tx?.log}, ${retData}`);
                }
            }
            return;
        }
        
        const deployerAcct: Web3Account = web3.beatoz.accounts.wallet.get(netInfo.ACCTS[1].ADDR)!;
        const commitOpt = {
            from:deployerAcct.address, 
            gas:"6000000", 
            sendMode: "commit"
        };

        mint().then( () => done() );
    }, 1000*20);
});
