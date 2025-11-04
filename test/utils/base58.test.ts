import { assert } from 'chai';
import lindaWebBuilder from '../helpers/lindaWebBuilder.js';


describe('LindaWeb.utils.base58', function () {
    describe('#encode58()', function () {
        it('should encode a buffer in base58 string', async function () {
            const lindaWeb = lindaWebBuilder.createInstance();

            const input = Buffer.from('0xbf7e698', 'utf-8');
            const expected = 'cnTsZgYWJRAw';

            assert.equal(lindaWeb.utils.base58.encode58(input), expected);

            const input2 = [30, 78, 62, 66, 37, 65, 36, 39, 38];
            const expected2 = 'PNfgHhpd9fqF';

            assert.equal(lindaWeb.utils.base58.encode58(input2), expected2);

            const input3 = '0xbf7e698';
            const expected3 = 'BLw3T83';

            assert.equal(lindaWeb.utils.base58.encode58(input3), expected3);

            const input5 = '12354345';
            const expected5 = '3toVqjxtiu2q';

            assert.equal(lindaWeb.utils.base58.encode58(input5), expected5);
        });

        it("should return '' or '1' if passing something different from a buffer", async function () {
            // TODO. Is this what we want?
            const lindaWeb = lindaWebBuilder.createInstance();

            assert.equal(lindaWeb.utils.base58.encode58([]), '');
            assert.equal(lindaWeb.utils.base58.encode58('some string'), '');
        });
    });

    describe('#decode58()', function () {
        it('should decode a base58 string in a buffer', async function () {
            const lindaWeb = lindaWebBuilder.createInstance();

            const input = 'cnTsZgYWJRAw';
            const expected = Buffer.from('0xbf7e698', 'utf-8');

            const decoded = lindaWeb.utils.base58.decode58(input);

            assert.equal(Buffer.compare(expected, Buffer.from(decoded)), 0);
        });

        it("should return [] or [0] if passing something '' or '1'", async function () {
            // TODO. As above. Is this what we want?
            const lindaWeb = lindaWebBuilder.createInstance();

            assert.equal(JSON.stringify(lindaWeb.utils.base58.decode58('')), '[]');
            assert.equal(JSON.stringify(lindaWeb.utils.base58.decode58('1')), '[0]');
        });
    });
});
