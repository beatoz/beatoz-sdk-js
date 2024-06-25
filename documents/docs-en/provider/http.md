# HttpProvider

## Summary
The `provider` of **@beatoz/web3** is an object that enables the connection to the BEATOZ network. To send transactions, query data, and interact with various functionalities of the network, you need to connect your web application to the BEATOZ node using the provider. The following code illustrates an example of connecting to the BEATOZ node via the provider.

## Getting Started
```Typescript
import { Web3 } from '@beatoz/web3';
const web3 = new Web3('https://rpc1.testnet.beatoz.io');
```
or
```Typescript
import { Web3, HttpProvider } from '@beatoz/web3';
const provider = new HttpProvider('https://rpc1.testnet.beatoz.io');
const web3 = new Web3(provider);
```
You can create a `provider` for `@beatoz/web3` using the above code, which allows you to interact with the BEATOZ node.

## Changing the Provider
```Typescript
import { Web3 } from '@beatoz/web3';
const web3 = new Web3('https://rpc1.testnet.beatoz.io');
web3.setProvider('https://rpc2.testnet.beatoz.io');
```

## httpProviderOptions
The HttpProvider takes the provider URL and optionally `httpProviderOptions` when creating a provider:

```Typescript
const httpProviderInstance = new HttpProvider(clientUrl, httpProviderOptions);
```

The `httpProviderOptions` interface is as follows:
```Typescript
const httpProviderOptions = {
    providerOptions: {
        body: undefined,
        cache: 'force-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        integrity: 'foo',
        keepalive: true,
        method: 'GET',
        mode: 'same-origin',
        redirect: 'error',
        referrer: 'foo',
        referrerPolicy: 'same-origin',
        signal: undefined,
        window: undefined,
    } as RequestInit,
};
```
For more detailed information, refer to the [Microsoft github - RequestInit](https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.requestinit.html) page.