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

import { Address, Uint } from './eth_types.js';
import { SupportedProviders } from './web3_base_provider.js';
import { Bytes, HexString } from './primitives_types.js';
import { EthExecutionAPI } from './apis/eth_execution_api.js';

export interface ContractInitOptions {
    /**
     * The maximum gas provided for a transaction (gas limit).
     */
    readonly gas?: Uint;
    readonly gasLimit?: Uint;
    /**
     * The gas price in wei to use for transactions.
     */
    readonly gasPrice?: Uint;
    /**
     * The address transactions should be made from
     */
    readonly from?: Address;
    /**
     * The byte code of the contract. Used when the contract gets {@link Contract.deploy | deployed}
     */
    readonly data?: Bytes;
    readonly input?: Bytes;

    readonly provider?: SupportedProviders<EthExecutionAPI> | string;
    /**
     * If `true`, the defaults of the contract instance will be updated automatically based on the changes of the context used to instantiate the contract.
     */
    readonly syncWithContext?: boolean;
}

export interface NonPayableCallOptions {
    nonce?: HexString;
    /**
     * The address which is the call (the transaction) should be made from. For calls the `from` property is optional however it is
     * highly recommended to explicitly set it or it may default to address(0) depending on your node or provider.
     */
    from?: Address;
    /**
     * The maximum gas (gas limit) provided for this call (this transaction)
     */
    gas?: string;
    maxPriorityFeePerGas?: HexString;
    maxFeePerGas?: HexString;
    /**
     * The gas price in wei to use for this call `transaction`.
     */
    gasPrice?: string;
    type?: string | number;
}

export interface PayableCallOptions extends NonPayableCallOptions {
    /**
     *
     */
    value?: string;
}
