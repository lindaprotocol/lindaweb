import { LindaWeb } from '../setup/LindaWeb.js';

export default class BlockLib {
    lindaWeb: LindaWeb;
    constructor(lindaWeb: LindaWeb) {
        if (!lindaWeb) throw new Error('Expected instances of LindaWeb and utils');
        this.lindaWeb = lindaWeb;
    }

    async getCurrent() {
        const block: any = await this.lindaWeb.fullNode.request('wallet/getnowblock');
        block.fromPlugin = true;
        return block;
    }

    pluginInterface() {
        return {
            requires: '^6.0.0',
            fullClass: true,
        };
    }
}
