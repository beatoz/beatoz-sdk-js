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
import erc20Json from '../fixtures/erc20-abi.json';
import deployedContract from '../fixtures/deployed.contract.json';
import Providers from '../../../../.providers.json';
const { DEVNET0: devnet0 } = Providers;
import { TrxProtoBuilder } from '@beatoz/web3-accounts';
import { BroadcastTxCommitResponse, TrxProto, VmCallResponse } from '@beatoz/web3-types';
import { decodeParameter } from '@beatoz/web3-abi';
import { Web3 } from '@beatoz/web3';

describe('transfer token test', () => {
    const web3 = new Web3(devnet0.WS);
    for(const acct of devnet0.ACCTS) {
        web3.beatoz.accounts.wallet.add(acct.KEY);
    }
    
    it('transfer function', (done) => {
        const fromAcct = web3.beatoz.accounts.wallet.get(devnet0.ACCTS[0].ADDR)
        const erc20Contract = new web3.beatoz.Contract(
            erc20Json,
            deployedContract.address,
        ) as any;

        erc20Contract.methods
            .transfer('0x0000000000000000000000000000000000000001', '1000')
            .broadcast({from: fromAcct!.address, gas:"250000"})
            .then((res:BroadcastTxCommitResponse) => {
                console.log('response', res);

                erc20Contract.methods.balanceOf('0x0000000000000000000000000000000000000001')
                    .call()
                    .then( (resp: VmCallResponse) => {
                        console.log('response', resp);
                        const hexBalance = `0x${resp.value.returnData ?? "00"}`;
                        console.log('balance', decodeParameter('uint', hexBalance));
                        done();
                    });
            });
        
    });

    it('transfer coin test (not evm)', async () => {

        const fromAcct = web3.beatoz.accounts.wallet.get(devnet0.ACCTS[0].ADDR);
        const acctInfo = await web3.beatoz.getAccount(fromAcct!.address)
        console.log("acctInfo", acctInfo);

        const tx: TrxProto = TrxProtoBuilder.buildTransferTrxProto({
            from: acctInfo.value.address,
            nonce: acctInfo.value.nonce,
            to: '0x0000000000000000000000000000000000000001',
            amount: '100',
            gas: 1000000,
            gasPrice: '250000000000',
        });

        const { rawTransaction } = fromAcct!.signTransaction(tx, devnet0.CHAINID);

        // broadcast raw transaction
        const result = await web3.beatoz.broadcastRawTxCommit(rawTransaction);
        console.log(result);
    });
});