const ChainUtil = require('../chain-util');

class Transaction {
  constructor() {
    this.id = ChainUtil.id();
    this.input = null;
    this.outputs = [];
  }

  update(senderWallet, recipient, amount) {
    const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);
    if (!senderOutput || senderOutput.amount < amount) {
      console.log(`Wrong wallet OR Amount: ${amount} exceeds balance.`);
      return;
    }
    senderOutput.amount -= amount;
    this.outputs.push({
      amount: amount,
      address: recipient
    });

    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  static newTransaction(senderWallet, recipient, amount) {
    const transaction = new this();

    // this should be validated by others.
    if (amount > senderWallet.balance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    transaction.outputs.push(
      ...[
        {
          amount: senderWallet.balance - amount,
          address: senderWallet.publicKey
        },
        {
          amount: amount,
          address: recipient
        }
      ]
    );

    Transaction.signTransaction(transaction, senderWallet);

    return transaction;
  }

  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
    };
  }

  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtil.hash(transaction.outputs)
    );
  }
}

module.exports = Transaction;