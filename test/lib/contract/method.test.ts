import { Address } from '../../../src/types/Lind.js';
import { assert } from 'chai';
import assertThrow from '../../helpers/assertThrow.js';
import broadcaster from '../../helpers/broadcaster.js';
import lindaWebBuilder from '../../helpers/lindaWebBuilder.js';
import { Contract, LindaWeb } from '../../setup/LindaWeb.js';
import contracts from '../../fixtures/contracts.js';
const testRevertContract = contracts.testRevert;
const testSetValContract = contracts.testSetVal;

describe('#contract.method', function () {
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

    describe('#send()', function () {
        let testRevert: Contract;
        let testSetVal: Contract;

        before(async function () {
            const tx = await broadcaster(
                lindaWeb.transactionBuilder.createSmartContract(
                    {
                        abi: testRevertContract.abi,
                        bytecode: testRevertContract.bytecode,
                    },
                    accounts.b58[0]
                ),
                accounts.pks[0]
            );
            testRevert = await lindaWeb.contract().at(tx.transaction.contract_address);

            const tx2 = await broadcaster(
                lindaWeb.transactionBuilder.createSmartContract(
                    {
                        abi: testSetValContract.abi,
                        bytecode: testSetValContract.bytecode,
                    },
                    accounts.b58[0]
                ),
                accounts.pks[0]
            );
            testSetVal = await lindaWeb.contract().at(tx2.transaction.contract_address);
        });

        it('should set accounts[2] as the owner and check it with getOwner(1)', async function () {
            await testRevert.setOwner(accounts.b58[2]).send();
            assert.equal(await testRevert.getOwner(1).call(), accounts.hex[2]);
        });

        it('should revert if trying to set TSeFTBYCy3r2kZNYsj86G6Yz6rsmPdYdFs as the owner', async function () {
            this.timeout(30000);
            await assertThrow(
                testRevert.setOwner('TSeFTBYCy3r2kZNYsj86G6Yz6rsmPdYdFs').send({ shouldPollResponse: true }),
                null,
                'REVERT'
            );
        });

        it('should set the val to 123', async function () {
            this.timeout(30000);
            let result = await testSetVal.set(123).send({
                shouldPollResponse: true,
                keepTxID: true,
            });
            assert.equal(result[0].length, 64);
            assert.equal(Number(result[1]), 123);
        });
    });

    describe('#call()', function () {
        let testRevert: Contract;

        before(async function () {
            const tx = await broadcaster(
                lindaWeb.transactionBuilder.createSmartContract(
                    {
                        abi: testRevertContract.abi,
                        bytecode: testRevertContract.bytecode,
                    },
                    accounts.b58[0]
                ),
                accounts.pks[0]
            );
            testRevert = await lindaWeb.contract().at(tx.transaction.contract_address);
            await testRevert.setOwner(accounts.b58[2]).send();
        });

        it('should getOwner(1) and get accounts[2]', async function () {
            assert.equal(await testRevert.getOwner(1).call(), accounts.hex[2]);
        });

        it('should revert if call getOwner(2)', async function () {
            await assertThrow(testRevert.getOwner(2).call(), 'REVERT opcode executed');
        });

        it('should revert if call getOwner2()', async function () {
            await assertThrow(testRevert.getOwner2(2).call(), 'REVERT opcode executed');
        });
    });
});
