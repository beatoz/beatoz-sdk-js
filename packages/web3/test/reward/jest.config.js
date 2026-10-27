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
const base = require('../config/jest.config');

module.exports = {
    ...base,
    // Load .env.reward before the test framework starts, so e2e_utils sees it.
    setupFiles: ['<rootDir>/../../scripts/jest/load-env.js'],
    // Run against the reward node (`yarn node:start:reward`), not the regular
    // one, and kept out of test:integration so that one still needs a single
    // node. The suite waits for inflation rewards, a cycle at a time.
    maxWorkers: 1,
    testTimeout: 120000,
    testMatch: ['<rootDir>/test/reward/**/*.(spec|test).(js|ts)'],
    collectCoverage: false,
};
