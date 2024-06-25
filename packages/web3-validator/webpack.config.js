const { getWebPackConfig } = require('../../webpack.base.config');

module.exports = getWebPackConfig(
    __dirname,
    'web3-validator.min.js',
    'web3-validator',
    'src/index.ts',
    'tsconfig.json',
);
