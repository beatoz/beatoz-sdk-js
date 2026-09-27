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

/**
 * Sample values read from whichever chain the tests are pointed at.
 *
 * Several suites used to query a pinned height (10000) or a pinned block
 * hash. Those values are stable on a given chain - Tendermint commits are
 * final and never reorganise - but they only exist on the one chain they
 * were taken from, so the suites broke as soon as the target changed.
 *
 * The suites do not assert anything about the contents of a particular
 * block. They check that the SDK builds the request and decodes the reply,
 * which any committed block exercises equally well. So ask the chain for a
 * sample rather than naming one.
 *
 * This is deliberately not in `e2e_utils.ts`: that file is configuration and
 * touches no chain, while everything here needs a live connection.
 */

import { Web3 } from '../../src';

/** Height of the latest committed block on the target chain. */
export const getLatestHeight = async (web3: Web3): Promise<number> => {
    const status = await web3.beatoz.status();
    return status.sync_info.latest_block_height;
};

/**
 * A height that is committed and safe to query.
 *
 * One below the tip, because results and validator sets for the newest
 * block may not be queryable the instant it is reported. Falls back to the
 * tip on a chain that only has one block.
 */
export const getSampleHeight = async (web3: Web3): Promise<number> => {
    const latest = await getLatestHeight(web3);
    return latest > 1 ? latest - 1 : latest;
};

/** The block id hash at a given height, in the form `blockByHash` accepts. */
export const getBlockHashAt = async (web3: Web3, height: number): Promise<string> => {
    const block = await web3.beatoz.block(height);
    return block.block_id.hash;
};
