const Transaction = require('./transaction');

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    const txIndex = this.transactions.findIndex(
      tx => tx.id === transaction.id
    );
    if (txIndex > -1) {
      this.transactions[txIndex] = transaction;
    }
    else {
      this.transactions.push(transaction);
    }
  }

  getExistingTx(address) {
    return this.transactions.find(tx => tx.input.address === address)
  }

  validTransactions() {
    return this.transactions.filter(tx => {
      const outputTotal = tx.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0);

      if (tx.input.amount !== outputTotal) {
        // todo: delete this transaction??
        console.log(`Invalid transaction form ${tx.input.address}`);
        return false;
      }

      if (!Transaction.verifyTransaction(tx)) {
        console.log(`Invalid signature from ${tx.input.address}`);
        return false;
      }

      return true;
    });
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;
