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
    transaction = wallet.createTransaction(recipient, amount, tp);
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

  it('clears transactions', () => {
    tp.clear();
    expect(tp.transactions).toEqual([]);
  });

  describe('mixing valid and corrupt transactions', () => {
    let validTxs, newTx;
    beforeEach(() => {
      validTxs = [...tp.transactions];
      for (let i = 0; i < 6; i++) {
        wallet = new Wallet();
        transaction = wallet.createTransaction(recipient, 30, tp);
        if (i % 2 === 0) {
          transaction.input.amount = 9999;
        }
        else {
          validTxs.push(transaction);
        }
      }
    });

    it('shows a difference between valid and corrupt transactions', () => {
      expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTxs));
    });

    it('grabs valid transactions', () => {
      expect(tp.validTransactions()).toEqual(validTxs);
    });
  });
});
