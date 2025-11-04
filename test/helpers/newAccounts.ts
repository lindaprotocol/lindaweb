import lindaWebBuilder from './lindaWebBuilder.js';

const amount = Number(process.argv[2]) || 10;

(async function () {
    await lindaWebBuilder.newTestAccounts(amount);
})();
