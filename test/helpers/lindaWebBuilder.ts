import chalk from 'chalk';
import { LindaWeb, utils } from '../setup/LindaWeb.js';
import jlog from './jlog.js';

import config from './config.js';
const { FULL_NODE_API, PRIVATE_KEY } = config;

const createInstance = (extraOptions = {}) => {
    const options = Object.assign(
        {
            fullHost: FULL_NODE_API,
            privateKey: PRIVATE_KEY,
        },
        extraOptions
    );
    return new LindaWeb(options);
};

let instance: LindaWeb;

const getInstance = () => {
    if (!instance) {
        instance = createInstance();
    }
    return instance;
};

const newTestAccounts = async (amount: number) => {
    const lindaWeb = createInstance();

    console.log(chalk.blue(`Generating ${amount} new accounts...`));
    await lindaWeb.fullNode.request('/admin/temporary-accounts-generation?accounts=' + amount);
    const lastCreated = await getTestAccounts(-1);
    jlog(lastCreated.b58);
};

const getTestAccounts = async (block: number) => {
    const accounts = {
        b58: [] as string[],
        hex: [] as string[],
        pks: [] as string[],
    };
    const lindaWeb = createInstance();
    const accountsJson: any = await lindaWeb.fullNode.request('/admin/accounts-json');
    const index =
        typeof block === 'number'
            ? block > -1 && block < accountsJson.more.length
                ? block
                : accountsJson.more.length - 1
            : undefined;
    accounts.pks = typeof block === 'number' ? accountsJson.more[index!].privateKeys : accountsJson.privateKeys;
    for (let i = 0; i < accounts.pks.length; i++) {
        const addr = LindaWeb.address.fromPrivateKey(accounts.pks[i]) as string;
        accounts.b58.push(addr);
        accounts.hex.push(LindaWeb.address.toHex(addr));
    }
    return Promise.resolve(accounts);
};

export default {
    createInstance,
    getInstance,
    newTestAccounts,
    getTestAccounts,
    LindaWeb,
    utils,
};
