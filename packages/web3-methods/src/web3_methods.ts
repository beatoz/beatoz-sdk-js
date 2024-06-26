﻿/*
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

import { Web3Context } from '@beatoz/web3-core';
import * as rpcMethodsWrappers from './rpc_method_wrappers.js';
import { TrxProto } from '@beatoz/web3-types';

export class Web3Method extends Web3Context {
    public constructor() {
        super();
    }

    getUrl(): string {
        return this.requestManager.provider.getClientUrl();
    }

    health() {
        return rpcMethodsWrappers.health(this);
    }

    status() {
        return rpcMethodsWrappers.status(this);
    }

    netInfo() {
        return rpcMethodsWrappers.netInfo(this);
    }

    blockchain(minHeight?: number | string, maxHeight?: number | string) {
        return rpcMethodsWrappers.blockchain(this, minHeight, maxHeight);
    }

    block(height?: string | number) {
        return rpcMethodsWrappers.block(this, height);
    }

    blockByHash(hash: string | Uint8Array) {
        return rpcMethodsWrappers.blockByHash(this, hash);
    }

    blockResults(height?: string | number) {
        return rpcMethodsWrappers.blockResults(this, height);
    }

    commit(height?: string | number) {
        return rpcMethodsWrappers.commit(this, height);
    }

    validators(height: string | number, page?: number, per_page?: number) {
        return rpcMethodsWrappers.validators(this, height, page, per_page);
    }

    genesis() {
        return rpcMethodsWrappers.genesis(this);
    }

    genesisChunked(chunk: number | string) {
        return rpcMethodsWrappers.genesisChunked(this, chunk);
    }

    dumpConsensusState() {
        return rpcMethodsWrappers.dumpConsensusState(this);
    }

    consensusState() {
        return rpcMethodsWrappers.consensusState(this);
    }

    consensusParams(height?: string | number) {
        return rpcMethodsWrappers.consensusParams(this, height);
    }

    unconfirmedTxs(limit: number) {
        return rpcMethodsWrappers.unconfirmedTxs(this, limit);
    }

    txSearch(query: string, prove?: boolean, page?: number, per_page?: number) {
        return rpcMethodsWrappers.txSearch(this, query, prove, page, per_page);
    }

    tx(hash: string | Uint8Array) {
        return rpcMethodsWrappers.tx(this, hash);
    }

    contractAddrFromTx(hash: string | Uint8Array) {
        return rpcMethodsWrappers.contractAddrFromTx(this, hash);
    }

    abciInfo() {
        return rpcMethodsWrappers.abciInfo(this);
    }

    abciQuery(path: string, data: string, height?: string | number, prove?: boolean) {
        return rpcMethodsWrappers.abciQuery(this, path, data, height, prove);
    }

    checkTx(tx: TrxProto) {
        return rpcMethodsWrappers.checkTx(this, tx);
    }

    numUnconfirmedTxs() {
        return rpcMethodsWrappers.numUnconfirmedTxs(this);
    }

    broadcastEvidence(evidence: string) {
        return rpcMethodsWrappers.broadcastEvidence(this, evidence);
    }

    broadcastTxSync(tx: TrxProto) {
        return rpcMethodsWrappers.broadcastTxSync(this, tx);
    }

    broadcastTxAsync(tx: TrxProto) {
        return rpcMethodsWrappers.broadcastTxAsync(this, tx);
    }

    broadcastTxCommit(tx: TrxProto) {
        return rpcMethodsWrappers.broadcastTxCommit(this, tx);
    }

    broadcastRawTxSync(signedRawTx: string) {
        return rpcMethodsWrappers.broadcastRawTxSync(this, signedRawTx);
    }

    broadcastRawTxAsync(signedRawTx: string) {
        return rpcMethodsWrappers.broadcastRawTxAsync(this, signedRawTx);
    }

    broadcastRawTxCommit(signedRawTx: string) {
        return rpcMethodsWrappers.broadcastRawTxCommit(this, signedRawTx);
    }

    delegatee(addr: string) {
        return rpcMethodsWrappers.delegatee(this, addr);
    }

    rule() {
        return rpcMethodsWrappers.rule(this);
    }

    getAccount(addr: string) {
        return rpcMethodsWrappers.getAccount(this, addr);
    }

    proposals(txHash: string) {
        return rpcMethodsWrappers.proposals(this, txHash);
    }

    stakes(addr: string) {
        if (!addr.startsWith('0x')) {
            addr = '0x' + addr;
        }

        return rpcMethodsWrappers.stakes(this, addr);
    }

    vmCall(addr: string, to: string, height: number, data: string) {
        return rpcMethodsWrappers.vmCall(this, addr, to, height, data);
    }

    subscribe(query: string) {
        console.log('subscribe query', query);
        return rpcMethodsWrappers.subscribe(this, query);
    }

    subscribeNewBlock() {
        return rpcMethodsWrappers.subscribeNewBlock(this);
    }

    subscribeNewBlockHeader() {
        return rpcMethodsWrappers.subscribeNewBlockHeader(this);
    }

    subscribeTx(query?: string) {
        return rpcMethodsWrappers.subscribeTx(this, query);
    }

    // public sendTransaction(
    //     transaction:
    //         | Transaction
    //         | TransactionWithFromLocalWalletIndex
    //         | TransactionWithToLocalWalletIndex
    //         | TransactionWithFromAndToLocalWalletIndex,
    //     options?: SendTransactionOptions,
    // ) {
    //     return rpcMethodsWrappers.sendTransaction(this, transaction, options);
    // }
}
