import { assert } from 'chai';
import lindaWebBuilder from '../helpers/lindaWebBuilder.js';
import { LindaWeb, Plugin, Lind } from '../setup/LindaWeb.js';
import GetNowBlock from '../helpers/GetNowBlock.js';
import BlockLib from '../helpers/BlockLib.js';
import { Block } from '../../src/types/APIResponse';

declare namespace globalThis {
    interface MyLindaWeb1 extends LindaWeb {
        lind: {
            getCurrentBlock(): Promise<Block & { fromPlugin: true }>;
            getLatestBlock(): Promise<Block & { fromPlugin: true }>;
            getSomeParameter(): any;
        } & Lind;
    }

    interface MyLindaWeb2 extends LindaWeb {
        blockLib: {
            getCurrent(): Promise<Block & { fromPlugin: true }>;
        }
    }
}

describe('LindaWeb.lib.plugin', async function () {
    let lindaWeb: LindaWeb;

    before(async function () {
        lindaWeb = lindaWebBuilder.createInstance();
    });

    describe('#constructor()', function () {
        it('should have been set a full instance in lindaWeb', function () {
            assert.instanceOf(lindaWeb.plugin, Plugin);
        });
    });

    describe('#plug GetNowBlock into lindaWeb.lind', async function () {
        it('should register the plugin GetNowBlock', async function () {
            const someParameter = 'someValue';

            let result = lindaWeb.plugin.register(GetNowBlock, {
                someParameter,
            });
            assert.isTrue(result.skipped.includes('_parseToken'));
            assert.isTrue(result.plugged.includes('getCurrentBlock'));
            assert.isTrue(result.plugged.includes('getLatestBlock'));

            const result2 = await (lindaWeb as globalThis.MyLindaWeb1).lind.getCurrentBlock();
            assert.isTrue(result2.fromPlugin);
            assert.equal(result2.blockID.length, 64);
            assert.isTrue(/^00000/.test(result2.blockID));

            const result3 = await (lindaWeb as globalThis.MyLindaWeb1).lind.getSomeParameter();
            assert.equal(result3, someParameter);
        });
    });

    describe('#plug BlockLib into lindaWeb at first level', async function () {
        it('should register the plugin and call a method', async function () {
            const result = lindaWeb.plugin.register(BlockLib);
            assert.equal(result.libs[0], 'BlockLib');
            const result2 = await (lindaWeb as globalThis.MyLindaWeb2).blockLib.getCurrent();
            assert.isTrue(result2.fromPlugin);
            assert.equal(result2.blockID.length, 64);
            assert.isTrue(/^00000/.test(result2.blockID));
        });

        it('should not register if lindaWeb is instantiated with the disablePlugins option', async function () {
            let lindaWeb2 = lindaWebBuilder.createInstance({ disablePlugins: true });
            let result = lindaWeb2.plugin.register(BlockLib);
            assert.isTrue(typeof result.error === 'string');
        });
    });
});
