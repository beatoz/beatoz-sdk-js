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

import { ERR_ABI_ENCODING, ERR_FORMATTERS, ERR_OPERATION_TIMEOUT } from '../error_codes.js';
import { BaseWeb3Error } from '../web3_error_base.js';

export class FormatterError extends BaseWeb3Error {
    public code = ERR_FORMATTERS;
}

export class OperationTimeoutError extends BaseWeb3Error {
    public code = ERR_OPERATION_TIMEOUT;
}

export class AbiError extends BaseWeb3Error {
    public code = ERR_ABI_ENCODING;
}
