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

import {
    AbiFunctionFragment,
    BroadcastTxCommitResponse,
    BytesUint8Array,
    BeatozExecutionAPI,
    SubscriptionEvent,
    AbiInput,
} from '@beatoz/web3-types';
import { Web3Context } from '@beatoz/web3-core';
import { rpcMethods } from '@beatoz/web3-rpc';
import { TrxProto } from '@beatoz/web3-types';
import { Stream } from 'xstream';
import { Web3Account, TrxProtoBuilder } from '@beatoz/web3-accounts';
import { encodeParameters } from '@beatoz/web3-abi';
import { atob } from 'buffer';

export async function sendDeploy(
    web3Context: Web3Context<BeatozExecutionAPI>,
    abi: AbiFunctionFragment,
    bytecode: string,
    args: any[],
    rWeb3Account: Web3Account,
    chainId: string,
    gas: number,
): Promise<BroadcastTxCommitResponse> {
    let encodedArguments;
    let bytecodeWithArguments;

    if (args.length > 0) {
        encodedArguments = encodeParameters(abi.inputs as AbiInput[], args);
        bytecodeWithArguments = bytecode + encodedArguments.slice(2);
    } else {
        bytecodeWithArguments = bytecode;
    }
    const searchAccount = await getAccount(web3Context, rWeb3Account.address);
    const ruleObject = await rule(web3Context);

    const tx = TrxProtoBuilder.buildContractTrxProto({
        from: rWeb3Account.address,
        to: '0000000000000000000000000000000000000000',
        nonce: searchAccount.value.nonce,
        gas: gas,
        gasPrice: ruleObject.value.gasPrice,
        amount: '0',
        payload: { data: bytecodeWithArguments },
    });
    TrxProtoBuilder.signTrxProto(tx, rWeb3Account, chainId);
    return broadcastTxCommit(web3Context, tx);
}

export async function call(
    web3Context: Web3Context<BeatozExecutionAPI>,
    contractAddress: string,
    encodeFunctionSignature: string,
    from: string,
    height?: number,
) {
    const vmCallResult = await vmCall(
        web3Context,
        from,
        contractAddress,
        height ? height : 0,
        encodeFunctionSignature,
    );
    if (vmCallResult.value.returnData) {
        const bytes = BytesUint8Array.b64ToBytes(vmCallResult.value.returnData);
        vmCallResult.value.returnData = bytes.toHex();
    }
    return vmCallResult;
}

export async function health(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.health(web3Context.requestManager);
}

export async function status(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.status(web3Context.requestManager);
}

export async function netInfo(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.netInfo(web3Context.requestManager);
}

export async function blockchain(
    web3Context: Web3Context<BeatozExecutionAPI>,
    minHeight?: number | string,
    maxHeight?: number | string,
) {
    return rpcMethods.blockchain(web3Context.requestManager, minHeight, maxHeight);
}

export async function block(web3Context: Web3Context<BeatozExecutionAPI>, height?: string | number) {
    return rpcMethods.block(web3Context.requestManager, height);
}

export async function blockByHash(
    web3Context: Web3Context<BeatozExecutionAPI>,
    hash: string | Uint8Array,
) {
    return rpcMethods.blockByHash(web3Context.requestManager, hash);
}

export async function blockResults(
    web3Context: Web3Context<BeatozExecutionAPI>,
    height?: string | number,
) {
    return rpcMethods.blockResults(web3Context.requestManager, height);
}

export async function commit(
    web3Context: Web3Context<BeatozExecutionAPI>,
    height?: number | string,
) {
    return rpcMethods.commit(web3Context.requestManager, height);
}

export async function validators(
    web3Context: Web3Context<BeatozExecutionAPI>,
    height: number | string,
    page?: number | string,
    per_page?: number | string,
) {
    return rpcMethods.validators(web3Context.requestManager, height, page, per_page);
}

export async function genesis(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.genesis(web3Context.requestManager);
}

export async function genesisChunked(
    web3Context: Web3Context<BeatozExecutionAPI>,
    chunk: number | string,
) {
    return rpcMethods.genesisChunked(web3Context.requestManager, chunk);
}

export async function dumpConsensusState(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.dumpConsensusState(web3Context.requestManager);
}

export async function consensusState(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.consensusState(web3Context.requestManager);
}

export async function consensusParams(
    web3Context: Web3Context<BeatozExecutionAPI>,
    height?: number | string,
) {
    return rpcMethods.consensusParams(web3Context.requestManager, height);
}

export async function unconfirmedTxs(
    web3Context: Web3Context<BeatozExecutionAPI>,
    limit: number | string,
) {
    return rpcMethods.unconfirmedTxs(web3Context.requestManager, limit);
}

export async function txSearch(
    web3Context: Web3Context<BeatozExecutionAPI>,
    query: string,
    prove?: boolean,
    page?: number | string,
    per_page?: number | string,
    order_by?: string,
) {
    return rpcMethods.txSearch(
        web3Context.requestManager,
        query,
        prove,
        page,
        per_page,
        order_by,
    );
}

export async function tx(web3Context: Web3Context<BeatozExecutionAPI>, hash: string | Uint8Array) {
    return rpcMethods.tx(web3Context.requestManager, hash);
}

export async function contractAddrFromTx(
    web3Context: Web3Context<BeatozExecutionAPI>,
    hash: string | Uint8Array,
) {
    const txResponse = await rpcMethods.tx(web3Context.requestManager, hash);
    if (!txResponse.result || !txResponse.result.events || txResponse.result.events.length <= 0) {
        throw Error('not found contract address');
    }

    let contractAddress = '';
    for (const event of txResponse.result.events) {
        if (event.type !== 'evm') continue;
        for (const attribute of event.attributes) {
            if (atob(attribute.key) !== 'contractAddress') continue;
            contractAddress = atob(attribute.value);
        }
    }

    if (!contractAddress.startsWith('0x')) contractAddress = '0x' + contractAddress;
    return contractAddress.toLowerCase();
}

export async function abciInfo(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.abciInfo(web3Context.requestManager);
}

export async function abciQuery(
    web3Context: Web3Context<BeatozExecutionAPI>,
    path: string,
    data: string,
    height?: number | string,
    prove?: boolean,
) {
    return rpcMethods.abciQuery(web3Context.requestManager, path, data, height, prove);
}

export async function checkTx(web3Context: Web3Context<BeatozExecutionAPI>, tx: TrxProto) {
    return rpcMethods.checkTx(web3Context.requestManager, tx);
}

export async function numUnconfirmedTxs(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.numUnconfirmedTxs(web3Context.requestManager);
}

export async function broadcastEvidence(
    web3Context: Web3Context<BeatozExecutionAPI>,
    evidence: string,
) {
    return rpcMethods.broadcastEvidence(web3Context.requestManager, evidence);
}

export async function broadcastTxSync(web3Context: Web3Context<BeatozExecutionAPI>, tx: TrxProto) {
    return rpcMethods.broadcastTxSync(web3Context.requestManager, tx);
}

export async function broadcastTxAsync(web3Context: Web3Context<BeatozExecutionAPI>, tx: TrxProto) {
    return rpcMethods.broadcastTxAsync(web3Context.requestManager, tx);
}

export async function broadcastTxCommit(web3Context: Web3Context<BeatozExecutionAPI>, tx: TrxProto) {
    return rpcMethods.broadcastTxCommit(web3Context.requestManager, tx);
}

export async function broadcastRawTxSync(
    web3Context: Web3Context<BeatozExecutionAPI>,
    signedRawTx: string,
) {
    return rpcMethods.broadcastRawTxSync(web3Context.requestManager, signedRawTx);
}

export async function broadcastRawTxAsync(
    web3Context: Web3Context<BeatozExecutionAPI>,
    signedRawTx: string,
) {
    return rpcMethods.broadcastRawTxAsync(web3Context.requestManager, signedRawTx);
}

export async function broadcastRawTxCommit(
    web3Context: Web3Context<BeatozExecutionAPI>,
    signedRawTx: string,
) {
    return rpcMethods.broadcastRawTxCommit(web3Context.requestManager, signedRawTx);
}

export async function delegatee(web3Context: Web3Context<BeatozExecutionAPI>, addr: string) {
    return rpcMethods.delegatee(web3Context.requestManager, addr);
}

export async function rule(web3Context: Web3Context<BeatozExecutionAPI>) {
    return rpcMethods.rule(web3Context.requestManager);
}

export async function getAccount(web3Context: Web3Context<BeatozExecutionAPI>, addr: string) {
    return rpcMethods.getAccount(web3Context.requestManager, addr);
}

export async function proposals(web3Context: Web3Context<BeatozExecutionAPI>, txHash: string) {
    return rpcMethods.proposals(web3Context.requestManager, txHash);
}

export async function stakes(web3Context: Web3Context<BeatozExecutionAPI>, addr: string) {
    return rpcMethods.stakes(web3Context.requestManager, addr);
}

export async function vmCall(
    web3Context: Web3Context<BeatozExecutionAPI>,
    addr: string,
    to: string,
    height: number,
    data: string,
) {
    return rpcMethods.vmCall(web3Context.requestManager, addr, to, height, data);
}

export async function vmEstimateGas(
    web3Context: Web3Context<BeatozExecutionAPI>,
    addr: string,
    to: string,
    data: string,
) {
    return rpcMethods.vmEstimateGas(web3Context.requestManager, addr, to, data);
}

export function subscribe(
    web3Context: Web3Context<BeatozExecutionAPI>,
    query: string,
): Stream<SubscriptionEvent> {
    return rpcMethods.subscribe(web3Context.requestManager, query);
}

export function subscribeNewBlock(
    web3Context: Web3Context<BeatozExecutionAPI>,
): Stream<SubscriptionEvent> {
    return rpcMethods.subscribeNewBlock(web3Context.requestManager);
}

export function subscribeNewBlockHeader(
    web3Context: Web3Context<BeatozExecutionAPI>,
): Stream<SubscriptionEvent> {
    return rpcMethods.subscribeNewBlockHeader(web3Context.requestManager);
}

export function subscribeTx(
    web3Context: Web3Context<BeatozExecutionAPI>,
    query?: string,
): Stream<SubscriptionEvent> {
    return rpcMethods.subscribeTx(web3Context.requestManager, query);
}
