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

import { Web3PromiEvent } from '@beatoz/web3-core';
import { SendTransactionEvents } from '@beatoz/web3-methods';
import {
    BlockNumberOrTag,
    HexString,
    TransactionReceipt,
    NonPayableCallOptions,
    PayableCallOptions,
    DEFAULT_RETURN_FORMAT,
    FormatType,
    AbiFragment,
    Address,
    Bytes,
    ContractAbi,
    HexString32Bytes,
    Uint,
    BroadcastTxAsyncResponse,
    BroadcastTxSyncResponse,
    BroadcastTxCommitResponse,
} from '@beatoz/web3-types';

export type NonPayableTxOptions = NonPayableCallOptions;
export type PayableTxOptions = PayableCallOptions;
export type BroadcastTxOptions = {
    sendMode?: string // 'async' | 'sync' | 'commit'
}

export type ContractAbiWithSignature = ReadonlyArray<AbiFragment & { signature: HexString }>;

export interface EventLog {
    readonly event: string;
    readonly id?: string;
    readonly logIndex?: bigint | number | string;
    readonly transactionIndex?: bigint | number | string;
    readonly transactionHash?: HexString32Bytes;
    readonly blockHash?: HexString32Bytes;
    readonly blockNumber?: bigint | number | string;
    readonly address: string;
    readonly topics: HexString[];
    readonly data: HexString;
    readonly raw?: { data: string; topics: unknown[] };
    readonly returnValues: Record<string, unknown>;
    readonly signature?: HexString;
}

export interface ContractEventOptions {
    /**
     * Let you filter events by indexed parameters, e.g. `{filter: {myNumber: [12,13]}}` means all events where `myNumber` is `12` or `13`.
     */
    filter?: Record<string, unknown>;
    /**
     * The block number (greater than or equal to) from which to get events on. Pre-defined block numbers as `earliest`, `latest`, `pending`, `safe` or `finalized` can also be used. For specific range use {@link Contract.getPastEvents}.
     */
    fromBlock?: BlockNumberOrTag;
    /**
     * This allows to manually set the topics for the event filter. If given the filter property and event signature, (topic[0]) will not be set automatically. Each topic can also be a nested array of topics that behaves as `or` operation between the given nested topics.
     */
    topics?: string[];
}

export interface ContractOptions {
    /**
     * The maximum gas provided for a transaction (gas limit).
     */
    readonly gas?: Uint;
    /**
     * The gas price in wei to use for transactions.
     */
    readonly gasPrice?: Uint;
    /**
     * The address transactions should be made from.
     */
    readonly from?: Address;
    /**
     * The byte code of the contract. Used when the contract gets {@link Contract.deploy | deployed}
     */
    readonly input?: Bytes;
    get jsonInterface(): ContractAbiWithSignature;
    set jsonInterface(value: ContractAbi);

    address?: Address; // All transactions generated by web3.js from this contract will contain this address as the "to".
    /**
     * The max priority fee per gas to use for transactions.
     */
    maxPriorityFeePerGas?: Uint;
    /**
     * The max fee per gas to use for transactions.
     */
    maxFeePerGas?: Uint;
}

export interface NonPayableMethodObject<Inputs = unknown[], Outputs = unknown[]> {
    arguments: Inputs;

    call<SpecialOutput = Outputs>(
        tx?: NonPayableCallOptions,
        block?: BlockNumberOrTag,
    ): Promise<SpecialOutput>;

    // send(
    //     tx?: NonPayableTxOptions,
    // ): Web3PromiEvent<
    //     FormatType<TransactionReceipt, typeof DEFAULT_RETURN_FORMAT>,
    //     SendTransactionEvents<typeof DEFAULT_RETURN_FORMAT>
    // >;
    send(
        tx?: NonPayableTxOptions | BroadcastTxOptions,
    ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | BroadcastTxCommitResponse>;

    broadcast (
        tx?: NonPayableTxOptions | BroadcastTxOptions,
    ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | BroadcastTxCommitResponse>;

    estimateGas<SpecialOutput = Outputs> (
        tx?: PayableCallOptions | NonPayableTxOptions
    ): Promise<SpecialOutput>;

    /**
     * Encodes the ABI for this method. The resulting hex string is 32-bit function signature hash plus the passed parameters in Solidity tightly packed format.
     * This can be used to send a transaction, call a method, or pass it into another smart contract’s method as arguments.
     * Set the data field on `web3.eth.sendTransaction` options as the encodeABI() result and it is the same as calling the contract method with `contract.myMethod.send()`.
     *
     * Some use cases for encodeABI() include: preparing a smart contract transaction for a multi signature wallet,
     * working with offline wallets and cold storage and creating transaction payload for complex smart contract proxy calls.
     *
     * @returns - The encoded ABI byte code to send via a transaction or call.
     */
    encodeABI(): string;
}

export interface PayableMethodObject<Inputs = unknown[], Outputs = unknown[]> {
    arguments: Inputs;
    call<SpecialOutput = Outputs>(
        tx?: PayableCallOptions,
        block?: BlockNumberOrTag,
    ): Promise<SpecialOutput>;

    // send(
    //     options?: PayableTxOptions | NonPayableTxOptions | BroadcastTxOptions,
    // ): Web3PromiEvent<
    //     FormatType<TransactionReceipt, typeof DEFAULT_RETURN_FORMAT>,
    //     SendTransactionEvents<typeof DEFAULT_RETURN_FORMAT>
    // >;
    send(
        tx?: PayableTxOptions | NonPayableTxOptions | BroadcastTxOptions,
    ):Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | BroadcastTxCommitResponse>;

    broadcast (
        tx?: PayableTxOptions | NonPayableTxOptions | BroadcastTxOptions,
    ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | BroadcastTxCommitResponse>;

    estimateGas<SpecialOutput = Outputs> (
        tx?: PayableCallOptions | NonPayableTxOptions
    ): Promise<SpecialOutput>;
    
    /**
     * Encodes the ABI for this method. The resulting hex string is 32-bit function signature hash plus the passed parameters in Solidity tightly packed format.
     * This can be used to send a transaction, call a method, or pass it into another smart contract’s method as arguments.
     * Set the data field on `web3.eth.sendTransaction` options as the encodeABI() result and it is the same as calling the contract method with `contract.myMethod.send()`.
     *
     * Some use cases for encodeABI() include: preparing a smart contract transaction for a multi signature wallet,
     * working with offline wallets and cold storage and creating transaction payload for complex smart contract proxy calls.
     *
     * @returns - The encoded ABI byte code to send via a transaction or call.
     */
    encodeABI(): HexString;
}
