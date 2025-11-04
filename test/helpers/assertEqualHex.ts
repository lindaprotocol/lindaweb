import { assert } from 'chai';
import { LindaWeb } from '../setup/LindaWeb.js';

export default async function (result: any, string: any) {
    assert.equal(result, LindaWeb.toHex(string).substring(2));
}
