const base = require('../config/jest.config');

module.exports = {
    ...base,
    maxWorkers: 1, // Nonce 체크로 인해 병렬 처리
    testTimeout: 10000,
    // testMatch: ['<rootDir>/test/unit/**/*.(spec|test).(js|ts)'],
    // testMatch: ['<rootDir>/test/unit/**/setProvider.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/multipleWeb3.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/status.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/blockchain.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/block.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/blockByHash.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/blockResults.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/validators.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/commit.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/genesis.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/genesisChunked.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/dumpConsensusState.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/consensusState.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/contractAddrFromTx.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/consensusParams.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/unconfirmedTxs.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/txSearch.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/tx.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/abciInfo.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/checkTx.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/numUnconfirmedTxs.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/delegatee.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/accounts.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/account.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/rule.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/stake.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/broadcastTxSync.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/broadcastTxAsync.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/broadcastTxCommit.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/broadcastRawTxSync.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/broadcastRawTxAsync.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/broadcastRawTxCommit.(spec|test).(js|ts)'], // 단일 테스트
     testMatch: ['<rootDir>/test/unit/**/subscribe.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/subscribeNewBlock.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/transfer.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/setdoc.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/contract.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/transfer.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/staking.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/unstaking.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/builder.(spec|test).(js|ts)'], // 단일 테스트
    // testMatch: ['<rootDir>/test/unit/**/health.(spec|test).(js|ts)'], // 단일 테스트

    coverageDirectory: '../../.coverage/unit',
    collectCoverageFrom: ['src/**'],
    collectCoverage: true,
    coverageReporters: [
        [
            'json',
            {
                file: 'web3-coverage.json',
            },
        ],
    ],
};
