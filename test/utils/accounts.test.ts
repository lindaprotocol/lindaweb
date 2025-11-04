import { assert } from 'chai';
import lindaWebBuilder from '../helpers/lindaWebBuilder.js';
import assertThrow from '../helpers/assertThrow.js';

describe('LindaWeb.utils.accounts', function () {
    describe('#generateAccount()', function () {
        it('should generate a new account', async function () {
            const lindaWeb = lindaWebBuilder.createInstance();

            const newAccount = await lindaWeb.utils.accounts.generateAccount();
            assert.equal(newAccount.privateKey.length, 64);
            assert.equal(newAccount.publicKey.length, 130);
            let address = lindaWeb.address.fromPrivateKey(newAccount.privateKey);
            assert.equal(address, newAccount.address.base58);
            assert.equal(lindaWeb.address.toHex(address as string), newAccount.address.hex.toLowerCase());
        });
    });

    describe('#generateRandom()', function () {
        describe('should generate a mnemonic phrase and an account', function () {
            it('should generate an account of the zero index when options param is not passed', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();

                const newAccount = await lindaWeb.utils.accounts.generateRandom();
                assert.equal(newAccount.privateKey.substring(2).length, 64);
                assert.equal(newAccount.publicKey.substring(2).length, 130);
                assert.isTrue(lindaWeb.utils.ethersUtils.isValidMnemonic(newAccount.mnemonic!.phrase));
                let address = lindaWeb.address.fromPrivateKey(newAccount.privateKey.replace(/^0x/, ''));
                assert.equal(address, newAccount.address);
                assert.equal(lindaWeb.address.toHex(address as string), lindaWeb.address.toHex(newAccount.address));
            });

            it('should generate an account when options param is zero', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();
                const newAccount = await lindaWeb.utils.accounts.generateRandom();
                assert.equal(newAccount.privateKey.substring(2).length, 64);
                assert.equal(newAccount.publicKey.substring(2).length, 130);
                assert.isTrue(lindaWeb.utils.ethersUtils.isValidMnemonic(newAccount.mnemonic!.phrase));
                let address = lindaWeb.address.fromPrivateKey(newAccount.privateKey.replace(/^0x/, ''));
                assert.equal(address, newAccount.address);
                assert.equal(lindaWeb.address.toHex(address as string), lindaWeb.address.toHex(newAccount.address));
            });

            it('should generate an account when options param is a positive interger', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();
                const newAccount = await lindaWeb.utils.accounts.generateRandom();
                assert.equal(newAccount.privateKey.substring(2).length, 64);
                assert.equal(newAccount.publicKey.substring(2).length, 130);
                assert.isTrue(lindaWeb.utils.ethersUtils.isValidMnemonic(newAccount.mnemonic!.phrase));
                let address = lindaWeb.address.fromPrivateKey(newAccount.privateKey.replace(/^0x/, ''));
                assert.equal(address, newAccount.address);
                assert.equal(lindaWeb.address.toHex(address as string), lindaWeb.address.toHex(newAccount.address));
            });

            it('should generate an account when options param is an empty object', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();
                const newAccount = await lindaWeb.utils.accounts.generateRandom();
                assert.equal(newAccount.privateKey.substring(2).length, 64);
                assert.equal(newAccount.publicKey.substring(2).length, 130);
                assert.isTrue(lindaWeb.utils.ethersUtils.isValidMnemonic(newAccount.mnemonic!.phrase));
                let address = lindaWeb.address.fromPrivateKey(newAccount.privateKey.replace(/^0x/, ''));
                assert.equal(address, newAccount.address);
                assert.equal(lindaWeb.address.toHex(address as string), lindaWeb.address.toHex(newAccount.address));
            });

            it('should generate an account of the given path when options param has a valid bip39 linda path', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();
                const newAccount = await lindaWeb.utils.accounts.generateRandom();
                assert.equal(newAccount.privateKey.substring(2).length, 64);
                assert.equal(newAccount.publicKey.substring(2).length, 130);
                assert.isTrue(lindaWeb.utils.ethersUtils.isValidMnemonic(newAccount.mnemonic!.phrase));
                let address = lindaWeb.address.fromPrivateKey(newAccount.privateKey.replace(/^0x/, ''));
                assert.equal(address, newAccount.address);
                assert.equal(lindaWeb.address.toHex(address as string), lindaWeb.address.toHex(newAccount.address));
            });
        });
    });

    describe('#generateAccountWithMnemonic()', function () {
        describe('should generate an account of the given mnemonic phrase', function () {
            it('should generate an account when passed a normal mnemonic pharase', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();

                const accountCreated = await lindaWeb.utils.accounts.generateRandom();

                const newAccount = await lindaWeb.utils.accounts.generateAccountWithMnemonic(accountCreated.mnemonic!.phrase);
                assert.equal(newAccount.privateKey.substring(2).length, 64);
                assert.equal(newAccount.publicKey.substring(2).length, 130);
                let address = lindaWeb.address.fromPrivateKey(newAccount.privateKey.replace(/^0x/, ''));
                assert.equal(address, newAccount.address);
                assert.equal(lindaWeb.address.toHex(address as string), lindaWeb.address.toHex(newAccount.address));
            });

            it('should generate an account when path is passed', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();

                const accountCreated = await lindaWeb.utils.accounts.generateRandom();

                const path = "m/44'/195'/0'/0/1";

                const newAccount = await lindaWeb.utils.accounts.generateAccountWithMnemonic(
                    accountCreated.mnemonic!.phrase,
                    path
                );
                assert.equal(newAccount.privateKey.substring(2).length, 64);
                assert.equal(newAccount.publicKey.substring(2).length, 130);
                let address = lindaWeb.address.fromPrivateKey(newAccount.privateKey.replace(/^0x/, ''));
                assert.equal(address, newAccount.address);
                assert.equal(lindaWeb.address.toHex(address as string), lindaWeb.address.toHex(newAccount.address));
            });

            it('should throw when path is an invalid bip39 pth', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();

                const accountCreated = await lindaWeb.utils.accounts.generateRandom();

                const path = '11';

                await assertThrow(
                    new Promise(() => lindaWeb.utils.accounts.generateAccountWithMnemonic(accountCreated.mnemonic!.phrase, path)),
                    'Invalid linda path provided'
                );
            });

            it('should generate an account when path is an invalid bip39 linda path', async function () {
                const lindaWeb = lindaWebBuilder.createInstance();

                const accountCreated = await lindaWeb.utils.accounts.generateRandom();

                const path = "m/44'/60'/0'/0/1";

                await assertThrow(
                    new Promise(() => lindaWeb.utils.accounts.generateAccountWithMnemonic(accountCreated.mnemonic!.phrase, path)),
                    'Invalid linda path provided'
                );
            });
        });
    });
});
