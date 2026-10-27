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

import { JsonRpcError, TransactionReceipt, HexString } from '@beatoz/web3-types';
import { ERR_CONTRACT, ERR_CONTRACT_EXECUTION_REVERTED } from '../error_codes.js';
import { BaseWeb3Error } from '../web3_error_base.js';

export class Web3ContractError extends BaseWeb3Error {
    public code = ERR_CONTRACT;
    public receipt?: TransactionReceipt;

    public constructor(message: string, receipt?: TransactionReceipt) {
        super(message);

        this.receipt = receipt;
    }
}
export type ProviderErrorData =
    HexString | { data: HexString } | { originalError: { data: HexString } };

/**
 * This class is expected to be set as an `innerError` inside ContractExecutionError
 * The properties would be typically decoded from the `data` if it was encoded according to EIP-838
 */
export class Eip838ExecutionError extends Web3ContractError {
    public readonly name: string;
    public code: number;
    public data?: HexString;
    public errorName?: string;
    public errorSignature?: string;
    public errorArgs?: { [K in string]: unknown };

    public innerError: Eip838ExecutionError | undefined;

    public constructor(error: JsonRpcError<ProviderErrorData> | Eip838ExecutionError) {
        super(error.message || 'Error');

        this.name = ('name' in error && error.name) || this.constructor.name;
        this.stack = ('stack' in error && error.stack) || undefined;
        this.code = error.code;

        // get embedded error details got from some providers like MetaMask
        // and set this.data from the inner error data for easier read.
        // note: the data is a hex string inside either:
        //	 error.data, error.data.data or error.data.originalError.data (https://github.com/web3/web3.js/issues/4454#issuecomment-1485953455)
        if (typeof error.data === 'object') {
            let originalError: { data: string };
            if ('originalError' in error.data) {
                originalError = error.data.originalError;
            } else {
                // Ganache has no `originalError` sub-object unlike others
                originalError = error.data;
            }
            this.data = originalError.data;
            this.innerError = new Eip838ExecutionError(
                originalError as JsonRpcError<ProviderErrorData>,
            );
        } else {
            this.data = error.data;
        }
    }

    public setDecodedProperties(
        errorName: string,
        errorSignature?: string,
        errorArgs?: { [K in string]: unknown },
    ) {
        this.errorName = errorName;
        this.errorSignature = errorSignature;
        this.errorArgs = errorArgs;
    }

    public toJSON() {
        let json = {
            ...super.toJSON(),
            data: this.data,
        } as {
            name: string;
            code: number;
            message: string;
            innerError: Error | Error[] | undefined;
            data: string;
            errorName?: string;
            errorSignature?: string;
            errorArgs?: { [K in string]: unknown };
        };

        if (this.errorName) {
            json = {
                ...json,
                errorName: this.errorName,
                errorSignature: this.errorSignature,
                errorArgs: this.errorArgs,
            };
        }
        return json;
    }
}

/**
 * Used when an error is raised while executing a function inside a smart contract.
 * The data is expected to be encoded according to EIP-848.
 */
export class ContractExecutionError extends Web3ContractError {
    public innerError: Eip838ExecutionError;

    public constructor(rpcError: JsonRpcError) {
        super('Error happened while trying to execute a function inside a smart contract');
        this.code = ERR_CONTRACT_EXECUTION_REVERTED;
        this.innerError = new Eip838ExecutionError(rpcError as JsonRpcError<ProviderErrorData>);
    }
}
