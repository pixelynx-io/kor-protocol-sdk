# KOR Protocol SDK

## Prerequisites

To follow this tutorial, ensure you have Node version 20 or later and npm version 8 or higher installed in your environment. You can download the latest LTS (Long Term Support) version from the Node.js official website.

### Create a React/Next Project

First, create a react project using the below guide:

https://react.dev/learn/start-a-new-react-project

### Install the Dependencies

While in the kor-ts-example folder, install the Kor Protocol SDK node package,

You can use any of the following package managers to install the dependencies:

`npm install --save @korprotocol_2/core-sdk`

or

`yarn add @korprotocol_2/core-sdk`

or

`pnpm add @korprotocol_2/core-sdk`

### SDK Initialization

To initialize the SDK, you need to provide your API key and the RPC URL of the blockchain network.

```
import { initKorSDK } from '@korprotocol_2/core-sdk';
const apiKey = 'your-api-key';
const rpcUrl = 'https://your-rpc-url';
const origin  = 'sandbox-origin-url'
const korSDK = initKorSDK(apiKey, {rpcUrl, chain, origin});
```

- API Key: Your unique identifier used to authenticate requests to the KOR Protocol backend. To obtain an API key, please reach out to the admin.
- RPC URL: This is the URL of the blockchain network you are connecting to. It could be the URL of a public or private Ethereum node.
- Chain: This is the id of the chain on which operations should be performed.
- Origin: Initializes the module in a sandbox/production environment. For sandbox environment use https://dq9c2zl6kih9v.cloudfront.net/kor-sdk-api

### [Developer Documentation](https://docs.korprotocol.io/sdk-reference)
