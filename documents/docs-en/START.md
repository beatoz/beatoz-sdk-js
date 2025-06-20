# Getting Started

**Welcome to the @beatoz/web3 Guide Documentation.**

@beatoz/web3 is a JavaScript library that allows you to interact with local or remote BEATOZ nodes using HTTP and WebSocket. The following documentation provides information on how to use @beatoz/web3 and includes example code.
This documentation is intended for developers using @beatoz/web3 version 1.0.12 or higher.

## Requirements

To use the @beatoz/web3 library, you will need the following requirements:
- Node.js (version 16.19.0 or higher)
- npm (version 8.19.0 or higher)

## Installation

To install @beatoz/web3, use npm and run the following command:
```shell
npm install @beatoz/web3
```

To install a specific version of @beatoz/web3, use the following command:
```shell
npm install @beatoz/web3@X.X.X
```

## Starting with @beatoz/web3
Once the installation of @beatoz/web3 is complete, you can use the library to connect to a BEATOZ node. Please check the following example to see how to establish a connection.

First, create a file in your working directory to write the example code.
```shell
$ touch beatoz.ts
```
In the generated beatoz.js file, write the following code.
```javascript
import { Web3 } from '@beatoz/web3';
const web3 = new Rweb3('https://rpc1.testnet.beatoz.io');

async function getAbciInfo() {
    const info = await web3.beatoz.abciInfo();
    console.log(info);
}

getAbciInfo();
```
The result of the above code is as follows.
```shell
{
  response: {
    version: '0.17.0',
    app_version: '72620543991349248',
    last_block_height: 231923,
    last_block_app_hash: '4MYzthbFGIFAGU/EOy+Dw1JjxjqBl1NimEryfjyHS9o='
  }
}
```
