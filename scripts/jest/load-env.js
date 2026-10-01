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

// Integration tests read their node address and funded keys from the
// environment. `.env` at the repository root is where `yarn node:start` writes
// them, and it is gitignored because the container regenerates the keys every
// time it initialises a fresh chain.
//
// Values already in the environment win, so CI can supply its own without a
// file, and a developer can override one for a single run.
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '..', '..', '.env'),
    override: false,
});
