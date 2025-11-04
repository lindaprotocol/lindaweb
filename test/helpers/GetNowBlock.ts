import { LindaWeb } from '../setup/LindaWeb.js';

let someParameter: any;

export default class GetNowBlock {
    lindaWeb: LindaWeb;
    constructor(lindaWeb: LindaWeb) {
        if (!lindaWeb) throw new Error('Expected instance of LindaWeb');

        this.lindaWeb = lindaWeb;
    }

    async someMethod() {
        const block: any = await this.lindaWeb.fullNode.request('wallet/getnowblock');
        block.fromPlugin = true;
        return block;
    }

    getSomeParameter() {
        return someParameter;
    }

    pluginInterface(options: any) {
        if (options.someParameter) {
            someParameter = options.someParameter;
        }
        return {
            requires: '^6.0.0',
            components: {
                lind: {
                    // will be overridden
                    getCurrentBlock: this.someMethod,

                    // will be added
                    getLatestBlock: this.someMethod,
                    getSomeParameter: this.getSomeParameter,

                    // will be skipped
                    _parseToken: function () {
                        //
                    },
                },
            },
        };
    }
}
