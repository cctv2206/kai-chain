const { INITIAL_BALANCE } = require('../config');
const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  toString() {
    return `Wallet -
      publicKey: ${this.publicKey.toString()}
      balance  : ${this.balance}`;
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  // todo: should we only have one transactionPool?
  createTransaction(recipient, amount, blockchain, transactionPool) {
    this.balance = this.calculateBalance(blockchain);

    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
      return;
    }

    let transaction = transactionPool.getExistingTx(this.publicKey);
    if (transaction) {
      transaction = transaction.update(this, recipient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recipient, amount);
    }
    transactionPool.updateOrAddTransaction(transaction);

    return transaction;
  }

  calculateBalance(blockchain) {
    let balance = this.balance;
    let transactions = [];
    blockchain.chain.forEach(block => {
      block.data.forEach(tx => {
        transactions.push(tx);
      });
    });

    const walletInputTxs = transactions.filter(
      tx => tx.input.address === this.publicKey
    );

    let startTime = 0;

    if (walletInputTxs.length > 0) {
      const mostRecentTx = walletInputTxs.reduce((prev, current) => {
        return prev.input.timestamp > current.input.timestamp ? prev : current;
      });
      startTime = mostRecentTx.input.timestamp;
      balance = mostRecentTx.outputs.find(
        output => output.address === this.publicKey
      ).amount;
    }

    transactions.forEach(tx => {
      if (tx.input.timestamp > startTime) {
        balance += tx.outputs
          .filter(output => output.address === this.publicKey)
          .reduce((total, output) => {
            return total + output.amount;
          }, 0);
      }
    });

    return balance;
  }

  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.address = 'blockchain-wallet';
    return blockchainWallet;
  }
}

module.exports = Wallet;
