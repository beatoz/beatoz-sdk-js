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
import { Web3 } from '../../src';
import Web3Method from '@beatoz/web3-methods';
import { getTestWsServer } from './e2e_utils';

describe('Web3 class', () => {
    it('should initialize Web3 instance correctly', () => {
        const rWeb3Instance = new Web3(getTestWsServer());

        // Check if the instance is correctly initialized
        expect(rWeb3Instance).toBeInstanceOf(Web3);
    });

    it('should initialize Web3Method module correctly', () => {
        const rWeb3Instance = new Web3(getTestWsServer());
        // Check if the beatoz module is correctly initialized
        expect(rWeb3Instance.beatoz).toBeInstanceOf(Web3Method);
    });
});
