import { SignedTransaction, Transaction } from '../../src/types/Transaction.js';
import lindaWebBuilder from '../helpers/lindaWebBuilder.js';

export default async function <T extends Transaction>(func: Promise<T> | null | T, pk?: string, transaction?: T) {
    const lindaWeb = lindaWebBuilder.createInstance();
    if (!transaction) {
        transaction = (await func)!;
    }
    const signedTransaction = await lindaWeb.lind.sign(transaction, pk);
    const result = {
        transaction,
        signedTransaction,
        receipt: await lindaWeb.lind.sendRawTransaction(signedTransaction as SignedTransaction),
    };
    return Promise.resolve(result);
}
