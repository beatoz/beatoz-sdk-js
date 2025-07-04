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
import { getDevWsServer, getDevAccountPrivateKey, getDevAccountAddress, getDevChainId } from './e2e_utils';
import { TrxProtoBuilder } from '@beatoz/web3-accounts';
import { BroadcastTxCommitResponse, TrxProto, VmCallResponse } from '@beatoz/web3-types';
import { decodeParameter } from '@beatoz/web3-abi';
import { Web3 } from '@beatoz/web3';

describe('estimateGas test', () => {
    const web3 = new Web3(getDevWsServer());
    const wallet = web3.beatoz.accounts.wallet.add(getDevAccountPrivateKey())
    it('estimateGas', (done) => {
        const erc20Contract = new web3.beatoz.Contract(
            erc20Json,
            '0xead63659858b031d453624c7b1a2e563cbba3a44',
        ) as any;

        erc20Contract.methods
            .transfer('0x0000000000000000000000000000000000000001', '1000')
            .estimateGas()
            .then((res:Number) => {
                console.log('estimated gas', res.toString());
                done();
            });
        
    });
});