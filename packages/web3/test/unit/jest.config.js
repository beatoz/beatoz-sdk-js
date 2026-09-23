const base = require('../config/jest.config');

module.exports = {
    ...base,
    maxWorkers: 1, // Nonce 체크로 인해 병렬 처리
    testTimeout: 10000,
    testMatch: ['<rootDir>/test/unit/**/*.(spec|test).(js|ts)'],

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
