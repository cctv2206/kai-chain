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
}

module.exports = TransactionPool;
