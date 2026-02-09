import { HttpProvider, providers } from './lib/providers/index.js';
import type { Providers } from './lib/providers/index.js';
import utils from './utils/index.js';
import { BigNumber } from 'bignumber.js';
import EventEmitter from 'eventemitter3';
import semver from 'semver';

import { TransactionBuilder } from './lib/TransactionBuilder/TransactionBuilder.js';
import { Lind } from './lib/lind.js';
import { Contract } from './lib/contract/index.js';
import { Plugin } from './lib/plugin.js';
import { Event } from './lib/event.js';
import { keccak256 } from './utils/ethersUtils.js';
import { fromHex, fromPrivateKey, isAddress, toHex, toChecksumAddress, isChecksumAddress } from './utils/address.js';
import { HeadersType } from './types/Providers.js';
import { isString } from './utils/validations.js';
import { DefaultAddress, NodeProvider, LindaWebOptions, IBigNumber } from './types/LindaWeb.js';
import { ContractAbiInterface, ContractInstance } from './types/ABI.js';
import { Address } from './types/Lind.js';

const DEFAULT_VERSION = '4.7.1';

const FEE_LIMIT = 150000000;

const version = '6.0.4';

function isValidOptions(options: unknown): options is LindaWebOptions {
    return (
        !!options &&
        typeof options === 'object' &&
        (!!(options as LindaWebOptions).fullNode || !!(options as LindaWebOptions).fullHost)
    );
}

export class LindaWeb extends EventEmitter {
    providers: Providers;
    BigNumber: typeof BigNumber;
    transactionBuilder: TransactionBuilder;
    lind: Lind;
    plugin: Plugin;
    event: Event;
    version: typeof LindaWeb.version;
    static version = version;
    utils: typeof utils;

    defaultBlock: number | false | 'earliest' | 'latest';
    defaultPrivateKey: string | false;
    defaultAddress: DefaultAddress;
    fullnodeVersion: string;
    feeLimit: number;

    fullNode!: HttpProvider;
    solidityNode!: HttpProvider;
    eventServer?: HttpProvider;

    constructor(options: LindaWebOptions);
    constructor(fullNode: NodeProvider, solidityNode: NodeProvider, eventServer?: NodeProvider, privateKey?: string);
    /* prettier-ignore */
    constructor(fullNode: NodeProvider, solidityNode: NodeProvider, eventServer: NodeProvider, privateKey?: string);
    constructor(
        options: LindaWebOptions | NodeProvider,
        solidityNode: NodeProvider = '',
        eventServer?: NodeProvider,
        privateKey = ''
    ) {
        super();

        let fullNode;
        let headers: HeadersType | false = false;
        let eventHeaders: HeadersType | false = false;

        if (isValidOptions(options)) {
            fullNode = options.fullNode || options.fullHost;
            solidityNode = (options.solidityNode || options.fullHost)!;
            eventServer = (options.eventServer || options.fullHost)!;
            headers = options.headers || false;
            eventHeaders = options.eventHeaders || headers;
            privateKey = options.privateKey!;
        } else {
            fullNode = options;
        }
        if (utils.isString(fullNode)) fullNode = new providers.HttpProvider(fullNode);

        if (utils.isString(solidityNode)) solidityNode = new providers.HttpProvider(solidityNode);

        if (utils.isString(eventServer)) eventServer = new providers.HttpProvider(eventServer);

        this.event = new Event(this);
        this.transactionBuilder = new TransactionBuilder(this);
        this.lind = new Lind(this);
        this.plugin = new Plugin(this, {
            disablePlugins: isValidOptions(options) ? options.disablePlugins : false,
        });
        this.utils = utils;

        this.setFullNode(fullNode as HttpProvider);
        this.setSolidityNode(solidityNode as HttpProvider);
        this.setEventServer(eventServer!);

        this.providers = providers;
        this.BigNumber = BigNumber;

        this.defaultBlock = false;
        this.defaultPrivateKey = false;
        this.defaultAddress = {
            hex: false,
            base58: false,
        };

        this.version = LindaWeb.version;
        this.sha3 = LindaWeb.sha3;
        this.fromUtf8 = LindaWeb.fromUtf8;
        this.address = LindaWeb.address;
        this.toAscii = LindaWeb.toAscii;
        this.toUtf8 = LindaWeb.toUtf8;
        this.isAddress = LindaWeb.isAddress;
        this.fromAscii = LindaWeb.fromAscii;
        this.toHex = LindaWeb.toHex;
        this.toBigNumber = LindaWeb.toBigNumber;
        this.toDecimal = LindaWeb.toDecimal;
        this.fromDecimal = LindaWeb.fromDecimal;
        this.toSun = LindaWeb.toSun;
        this.fromSun = LindaWeb.fromSun;
        this.createAccount = LindaWeb.createAccount;
        this.createRandom = LindaWeb.createRandom;
        this.fromMnemonic = LindaWeb.fromMnemonic;

        if (privateKey) this.setPrivateKey(privateKey);
        this.fullnodeVersion = DEFAULT_VERSION;
        this.feeLimit = FEE_LIMIT;

        if (headers) {
            this.setFullNodeHeader(headers);
        }

        if (eventHeaders) {
            this.setEventHeader(eventHeaders);
        }
    }

    async getFullnodeVersion() {
        try {
            const nodeInfo = await this.lind.getNodeInfo();
            this.fullnodeVersion = nodeInfo.configNodeInfo.codeVersion;
            if (this.fullnodeVersion.split('.').length === 2) {
                this.fullnodeVersion += '.0';
            }
        } catch (err) {
            this.fullnodeVersion = DEFAULT_VERSION;
        }
    }

    setDefaultBlock(blockID: false | 'latest' | 'earliest' | number = false) {
        if ([false, 'latest', 'earliest', 0].includes(blockID)) {
            return (this.defaultBlock = blockID);
        }

        if (!utils.isInteger(blockID) || !blockID) throw new Error('Invalid block ID provided');

        return (this.defaultBlock = Math.abs(blockID));
    }

    setPrivateKey(privateKey: string) {
        try {
            this.setAddress(LindaWeb.address.fromPrivateKey(privateKey) as string);
        } catch {
            throw new Error('Invalid private key provided');
        }

        this.defaultPrivateKey = privateKey;
        this.emit('privateKeyChanged', privateKey);
    }

    setAddress(address: string) {
        if (!LindaWeb.isAddress(address)) throw new Error('Invalid address provided');

        const hex = LindaWeb.address.toHex(address);
        const base58 = LindaWeb.address.fromHex(address);

        if (this.defaultPrivateKey && LindaWeb.address.fromPrivateKey(this.defaultPrivateKey) !== base58)
            this.defaultPrivateKey = false;

        this.defaultAddress = {
            hex,
            base58,
        };

        this.emit('addressChanged', { hex, base58 });
    }

    fullnodeSatisfies(version: string) {
        return semver.satisfies(this.fullnodeVersion, version);
    }

    isValidProvider(provider: unknown) {
        return Object.values(providers).some((knownProvider) => provider instanceof knownProvider);
    }

    setFullNode(fullNode: HttpProvider | string) {
        if (isString(fullNode)) fullNode = new providers.HttpProvider(fullNode);

        if (!this.isValidProvider(fullNode)) throw new Error('Invalid full node provided');

        this.fullNode = fullNode;
        this.fullNode.setStatusPage('wallet/getnowblock');
    }

    setSolidityNode(solidityNode: HttpProvider | string) {
        if (utils.isString(solidityNode)) solidityNode = new providers.HttpProvider(solidityNode);

        if (!this.isValidProvider(solidityNode)) throw new Error('Invalid solidity node provided');

        this.solidityNode = solidityNode;
        this.solidityNode.setStatusPage('walletsolidity/getnowblock');
    }

    setEventServer(eventServer: NodeProvider, healthcheck?: string) {
        this.event.setServer(eventServer, healthcheck);
    }

    setHeader(headers = {}) {
        const fullNode = new providers.HttpProvider(this.fullNode.host, 30000, '', '', headers);
        const solidityNode = new providers.HttpProvider(this.solidityNode.host, 30000, '', '', headers);
        const eventServer = new providers.HttpProvider(this.eventServer!.host, 30000, '', '', headers);

        this.setFullNode(fullNode);
        this.setSolidityNode(solidityNode);
        this.setEventServer(eventServer);
    }

    setFullNodeHeader(headers = {}) {
        const fullNode = new providers.HttpProvider(this.fullNode.host, 30000, '', '', headers);
        const solidityNode = new providers.HttpProvider(this.solidityNode.host, 30000, '', '', headers);

        this.setFullNode(fullNode);
        this.setSolidityNode(solidityNode);
    }

    setEventHeader(headers = {}) {
        const eventServer = new providers.HttpProvider(this.eventServer!.host, 30000, '', '', headers);
        this.setEventServer(eventServer);
    }

    currentProviders() {
        return {
            fullNode: this.fullNode,
            solidityNode: this.solidityNode,
            eventServer: this.eventServer,
        };
    }

    currentProvider() {
        return this.currentProviders();
    }

    getEventResult(...params: Parameters<Event['getEventsByContractAddress']>): ReturnType<Event['getEventsByContractAddress']> {
        return this.event.getEventsByContractAddress(...params);
    }

    getEventByTransactionID(
        ...params: Parameters<Event['getEventsByTransactionID']>
    ): ReturnType<Event['getEventsByTransactionID']> {
        return this.event.getEventsByTransactionID(...params);
    }

    contract<Abi extends ContractAbiInterface>(abi: Abi = [] as any, address?: Address): ContractInstance<Abi> {
        return new Contract<Abi>(this, abi, address!) as ContractInstance<Abi>;
    }

    address: typeof LindaWeb.address;
    static get address() {
        return {
            fromHex(address: string) {
                return fromHex(address);
            },
            toHex(address: string) {
                return toHex(address);
            },
            toChecksumAddress(address: string) {
                return toChecksumAddress(address);
            },
            isChecksumAddress(address: string) {
                return isChecksumAddress(address);
            },
            fromPrivateKey(privateKey: string, strict = false) {
                return fromPrivateKey(privateKey, strict);
            },
        };
    }

    sha3: typeof LindaWeb.sha3;
    static sha3(string: string, prefix = true) {
        return (prefix ? '0x' : '') + keccak256(Buffer.from(string, 'utf-8')).toString().substring(2);
    }

    toHex: typeof LindaWeb.toHex;
    static toHex(val: string | number | boolean | Record<string | number | symbol, unknown> | unknown[] | IBigNumber) {
        if (utils.isBoolean(val)) return LindaWeb.fromDecimal(+val);

        if (utils.isBigNumber(val)) return LindaWeb.fromDecimal(val);

        if (typeof val === 'object') return LindaWeb.fromUtf8(JSON.stringify(val));

        if (utils.isString(val)) {
            if (/^(-|)0x/.test(val)) return val;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (!isFinite(val) || /^\s*$/.test(val)) return LindaWeb.fromUtf8(val);
        }

        const result = LindaWeb.fromDecimal(val as number);
        if (result === '0xNaN') {
            throw new Error('The passed value is not convertible to a hex string');
        } else {
            return result;
        }
    }

    toUtf8: typeof LindaWeb.toUtf8;
    static toUtf8(hex: string) {
        if (utils.isHex(hex)) {
            hex = hex.replace(/^0x/, '');
            return Buffer.from(hex, 'hex').toString('utf8');
        } else {
            throw new Error('The passed value is not a valid hex string');
        }
    }

    fromUtf8: typeof LindaWeb.fromUtf8;
    static fromUtf8(string: string) {
        if (!utils.isString(string)) {
            throw new Error('The passed value is not a valid utf-8 string');
        }
        return '0x' + Buffer.from(string, 'utf8').toString('hex');
    }

    toAscii: typeof LindaWeb.toAscii;
    static toAscii(hex: string) {
        if (utils.isHex(hex)) {
            let str = '';
            let i = 0;
            const l = hex.length;
            if (hex.substring(0, 2) === '0x') {
                i = 2;
            }
            for (; i < l; i += 2) {
                const code = parseInt(hex.substr(i, 2), 16);
                str += String.fromCharCode(code);
            }
            return str;
        } else {
            throw new Error('The passed value is not a valid hex string');
        }
    }

    fromAscii: typeof LindaWeb.fromAscii;
    static fromAscii(string: string, padding?: number) {
        if (!utils.isString(string)) {
            throw new Error('The passed value is not a valid utf-8 string');
        }
        return '0x' + Buffer.from(string, 'ascii').toString('hex').padEnd(padding!, '0');
    }

    toDecimal: typeof LindaWeb.toDecimal;
    static toDecimal(value: string | number | IBigNumber) {
        return LindaWeb.toBigNumber(value).toNumber();
    }

    fromDecimal: typeof LindaWeb.fromDecimal;
    static fromDecimal(value: number | IBigNumber) {
        const number = LindaWeb.toBigNumber(value);
        const result = number.toString(16);

        return number.isLessThan(0) ? '-0x' + result.substr(1) : '0x' + result;
    }

    fromSun: typeof LindaWeb.fromSun;
    static fromSun(sun: number): string | IBigNumber {
        const lind = LindaWeb.toBigNumber(sun).div(1_000_000);
        return utils.isBigNumber(sun) ? lind : lind.toString(10);
    }

    toSun: typeof LindaWeb.toSun;
    static toSun(lind: number): string | IBigNumber {
        const sun = LindaWeb.toBigNumber(lind).times(1_000_000);
        return utils.isBigNumber(lind) ? sun : sun.toString(10);
    }

    toBigNumber: typeof LindaWeb.toBigNumber;
    static toBigNumber(amount: string | number | IBigNumber = 0): IBigNumber {
        if (utils.isBigNumber(amount)) return amount;

        if (utils.isString(amount) && /^(-|)0x/.test(amount)) return new BigNumber(amount.replace('0x', ''), 16);

        return new BigNumber(amount.toString(10), 10);
    }

    isAddress: typeof LindaWeb.isAddress;
    static isAddress(address: unknown = ''): boolean {
        return isAddress(address);
    }

    createAccount: typeof LindaWeb.createAccount;
    static async createAccount() {
        const account = utils.accounts.generateAccount();

        return account;
    }

    createRandom: typeof LindaWeb.createRandom;
    static createRandom(
        ...params: Parameters<(typeof utils)['accounts']['generateRandom']>
    ): ReturnType<(typeof utils)['accounts']['generateRandom']> {
        const account = utils.accounts.generateRandom(...params);

        return account;
    }

    fromMnemonic: typeof LindaWeb.fromMnemonic;
    static fromMnemonic(
        ...params: Parameters<(typeof utils)['accounts']['generateAccountWithMnemonic']>
    ): ReturnType<(typeof utils)['accounts']['generateAccountWithMnemonic']> {
        const account = utils.accounts.generateAccountWithMnemonic(...params);

        return account;
    }

    async isConnected() {
        return {
            fullNode: await this.fullNode.isConnected(),
            solidityNode: await this.solidityNode.isConnected(),
            eventServer: this.eventServer && (await this.eventServer.isConnected()),
        };
    }
}
export default LindaWeb;
