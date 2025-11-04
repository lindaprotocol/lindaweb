import { Address } from '../../../src/types/Lind';
import { assert } from 'chai';
import wait from '../../helpers/wait.js';
import broadcaster from '../../helpers/broadcaster.js';
import lindaWebBuilder from '../../helpers/lindaWebBuilder.js';
import { LindaWeb } from '../../setup/LindaWeb.js';
import contracts from '../../fixtures/contracts';
import { Contract } from '../../../src/lib/contract';

const testCustomError = contracts.testCustomError;

describe('#contract.index', function () {
    let accounts: {
        hex: Address[];
        b58: Address[];
        pks: string[];
    };
    let lindaWeb: LindaWeb;

    before(async function () {
        lindaWeb = lindaWebBuilder.createInstance();
        // ALERT this works only with Linda Quickstart:
        accounts = await lindaWebBuilder.getTestAccounts(-1);
    });

    describe('#customError', function () {
        let customError: Contract;

        before(async function () {
            const tx = await broadcaster(
                lindaWeb.transactionBuilder.createSmartContract(
                    {
                        abi: testCustomError.abi,
                        bytecode: testCustomError.bytecode,
                    },
                    accounts.b58[0]
                ),
                accounts.pks[0]
            );
            customError = lindaWeb.contract(testCustomError.abi, tx.transaction.contract_address);
        });

        it('should revert with custom error', async () => {
            const txid = await customError.test(111).send();
            await wait(10);
            const data = await lindaWeb.lind.getTransactionInfo(txid);
            const errorData = data.contractResult;
            const expectedErrorData =
                LindaWeb.sha3('CustomError(uint256,uint256)', false).slice(0, 8) +
                '000000000000000000000000000000000000000000000000000000000000006f' + // 111
                '0000000000000000000000000000000000000000000000000000000000000001'; // 1
            assert.equal(errorData.join(''), expectedErrorData);
        });
    });
});
