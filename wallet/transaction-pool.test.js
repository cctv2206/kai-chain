const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('Transaction Pool test', () => {
  let wallet, transactionPool, recipient, amount, transaction;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    recipient = 'some-fake-address';
    amount = 50;
    transaction = Transaction.newTransaction(wallet, recipient, amount);
    tp.updateOrAddTransaction(transaction);
  });

  it('adds a new transaction to the pool', () => {
    expect(tp.transactions.length).toEqual(1);
    expect(tp.transactions.find(tx => tx.id === transaction.id)).toEqual(transaction);
  });

  it('updates an existing transaction', () => {
    const oldTx = JSON.stringify(transaction);
    const newTx = transaction.update(wallet, 'some-other-address', 20);
    tp.updateOrAddTransaction(newTx);
    expect(tp.transactions.length).toEqual(1);
    expect(tp.transactions.find(tx => tx.id === newTx.id)).not.toEqual(oldTx);
  });
});
