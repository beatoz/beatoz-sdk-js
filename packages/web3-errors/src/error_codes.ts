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

// Response error
export const ERR_RESPONSE = 100;
export const ERR_INVALID_RESPONSE = 101;

// Generic errors
export const ERR_FORMATTERS = 201;
export const ERR_OPERATION_TIMEOUT = 203;
export const ERR_ABI_ENCODING = 205;

// Contract error codes
export const ERR_CONTRACT = 300;
export const ERR_CONTRACT_EXECUTION_REVERTED = 310;

// Utils error codes
export const ERR_INVALID_STRING = 1001;
export const ERR_INVALID_BYTES = 1002;
export const ERR_INVALID_NUMBER = 1003;
export const ERR_INVALID_UNIT = 1004;
export const ERR_INVALID_ADDRESS = 1005;
export const ERR_INVALID_HEX = 1006;
export const ERR_INVALID_BOOLEAN = 1008;
export const ERR_INVALID_UNSIGNED_INTEGER = 1009;
export const ERR_INVALID_SIZE = 1010;
export const ERR_INVALID_LARGE_VALUE = 1011;
export const ERR_INVALID_NIBBLE_WIDTH = 1014;

// Validation error codes
export const ERR_VALIDATION = 1100;

// rpc error codes EIP-1474
export const ERR_RPC_INVALID_JSON = -32700;
export const ERR_RPC_INVALID_REQUEST = -32600;
export const ERR_RPC_INVALID_METHOD = -32601;
export const ERR_RPC_INVALID_PARAMS = -32602;
export const ERR_RPC_INTERNAL_ERROR = -32603;
export const ERR_RPC_INVALID_INPUT = -32000;
export const ERR_RPC_MISSING_RESOURCE = -32001;
export const ERR_RPC_UNAVAILABLE_RESOURCE = -32002;
export const ERR_RPC_TRANSACTION_REJECTED = -32003;
export const ERR_RPC_UNSUPPORTED_METHOD = -32004;
export const ERR_RPC_LIMIT_EXCEEDED = -32005;
export const ERR_RPC_NOT_SUPPORTED = -32006;
