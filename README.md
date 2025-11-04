<h1 align="center">
  <a href="https://lindaweb.network">
    <img align="center" src="https://raw.githubusercontent.com/lindaprotocol/lindaweb/master/assets/logo.png"/>
  </a>
</h1>

<p align="center">
  <a href="https://discord.gg/FgvVFQgdCW">
    <img src="https://img.shields.io/badge/chat-on%20discord-brightgreen.svg">
  </a>

  <a href="https://github.com/lindaprotocol/lindaweb/issues">
    <img src="https://img.shields.io/github/issues/linda-us/tronweb.svg">
  </a>

  <a href="https://github.com/lindaprotocol/lindaweb/pulls">
    <img src="https://img.shields.io/github/issues-pr/tron-us/tronweb.svg">
  </a>

  <a href="https://github.com/lindaprotocol/lindaweb/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/tron-us/tronweb.svg">
  </a>

  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/tron-us/tronweb.svg">
  </a>
</p>

## What is LindaWeb?

[LindaWeb](https://lindaweb.network) aims to deliver a unified, seamless development experience influenced by Ethereum's [Web3](https://github.com/ethereum/web3.js/) implementation. We have taken the core ideas and expanded upon them to unlock the functionality of LINDA's unique feature set along with offering new tools for integrating DApps in the browser, Node.js and IoT devices.

To better support its use in TypeScript projects, we have rewritten the entire library in TypeScript. And to make the LindaWeb API more secure and consistent, there are some breaking changes. <font color=red>Please check out [<font color=red>6.x API documentation</font>](https://lindaweb.network/docu/docs/intro/)</font> for detailed changes so you can start using the new TypeScript version of LindaWeb early. Any questions or feedback are welcome [here](https://github.com/lindaprotocol/lindaweb/issues/new).

**Project scope**

Any new LINDA feature will be incorporated into LindaWeb. Changes to the API to improve quality-of-life are in-scope for the project. We will not necessarily maintain feature parity with Web3.js going forward as this is a separate project, not a synchronized fork.

## HomePage

__[lindaweb.network](https://lindaweb.network)__

## Compatibility
- Version built for Node.js v14 and above
- Version built for browsers with more than 0.25% market share

You can access either version specifically from the dist folder.

LindaWeb is also compatible with frontend frameworks such as:
- Angular
- React
- Vue.

You can also ship LindaWeb in a Chrome extension.

## Recent History

For recent history, see the [CHANGELOG](https://github.com/lindaprotocol/lindaweb/blob/master/CHANGELOG.md). You can check it out for:
- New features
- Dependencies update
- Bug fix

## Installation

### Node.js
```bash
npm install lindaweb
```
or
```bash
yarn add lindaweb
```

### Browser

The easiest way to use LindaWeb in a browser is to install it as above and copy the dist file to your working folder. For example:
```
cp node_modules/lindaweb/dist/LindaWeb.js ./js/lindaweb.js
```
so that you can call it in your HTML page as
```
<script src="./js/lindaweb.js"><script>
```

This project is also published on NPM and you can access CDN mirrors of this release (please use sub-resource integrity for any `<script>` includes).

## Testnet

Shasta is the official Linda testnet. To use it use the following endpoint:
```
https://api.shasta.lindagrid.io
```
Get some Shasta LIND at https://www.lindagrid.io/shasta and play with it.
Anything you do should be explorable on https://shasta.lindascan.org

## Your local private network for heavy testing

You can set up your own private network, running Linda Quickstart. To do it you must [install Docker](https://docs.docker.com/install/) and, when ready, run a command like

```bash
docker run -it --rm \
  -p 9090:9090 \
  -e "defaultBalance=100000" \
  -e "showQueryString=true" \
  -e "showBody=true" \
  -e "formatJson=true" \
  --name linda \
  lindatools/quickstart
```

[More details about Linda Quickstart on GitHub](https://github.com/tron-us/docker-tron-quickstart)

## Creating an Instance

First of all, in your typescript file, define LindaWeb:

```typescript
import { LindaWeb, utils as LindaWebUtils, Lind, TransactionBuilder, Contract, Event, Plugin } from 'lindaweb';
```

Please note that this is not the same as v5.x. If you want to dive into more differences, check out [migration guide](https://lindaweb.network/docu/docs/Migrating%20from%20v5)

When you instantiate LindaWeb you can define

* fullNode
* solidityNode
* eventServer
* privateKey

you can also set a

* fullHost

which works as a jolly. If you do so, though, the more precise specification has priority.
Supposing you are using a server which provides everything, like LindaGrid, you can instantiate LindaWeb as:

```js
const lindaWeb = new LindaWeb({
    fullHost: 'https://api.lindagrid.io',
    headers: { "LINDA-PRO-API-KEY": 'your api key' },
    privateKey: 'your private key'
})
```

For retro-compatibility, though, you can continue to use the old approach, where any parameter is passed separately:
```js
const lindaWeb = new LindaWeb(fullNode, solidityNode, eventServer, privateKey)
lindaWeb.setHeader({ "LINDA-PRO-API-KEY": 'your api key' });
```

If you are, for example, using a server as full and solidity node, and another server for the events, you can set it as:

```js
const lindaWeb = new LindaWeb({
    fullHost: 'https://api.lindagrid.io',
    eventServer: 'https://api.someotherevent.io',
    privateKey: 'your private key'
  }
)
```

If you are using different servers for anything, you can do
```js
const lindaWeb = new LindaWeb({
    fullNode: 'https://some-node.tld',
    solidityNode: 'https://some-other-node.tld',
    eventServer: 'https://some-event-server.tld',
    privateKey: 'your private key'
  }
)
```

## FAQ

1. Cannot destructure property 'Transaction' of 'globalThis.LindaWebProto' as it is undefined.

This is a problem caused by webpack as it doesn't load cjs file correctly. To solve this problem, you need to add a new rule like below:
```
{
      test: /\.cjs$/,
      type: 'javascript/auto'
}
```

For more questions, please refer to [LindaWeb Doc](https://lindaweb.network/docu/docs/Migrating%20from%20v5#faq).

## Integrity Check

The package files will be signed using a GPG key pair, and the correctness of the signature will be verified using the following public key:

```
pub: 4371 AB85 E5A5 8FAA 88AD 7FDF 9945 DBCA 8C4B B810
uid: dev@lindaweb.network
```

## Contributions

In order to contribute you can

* fork this repo and clone it locally
* install the dependencies — `npm i`
* do your changes to the code
* build the LindaWeb dist files — `npm run build:all`
* run a local private network using Linda Quickstart
* run the tests — `npm run test`
* push your changes and open a pull request

Contact the team at https://cn.developers.linda.network/docs/online-technical-support


## Licence

LindaWeb is distributed under a MIT licence.


