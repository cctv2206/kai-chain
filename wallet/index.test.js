const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');

describe('Wallet test', () => {
  let wallet, txPool;

  beforeEach(() => {
    wallet = new Wallet();
    txPool = new TransactionPool();
  });

  describe('creating a tx', () => {
    let tx, sendAmount, recipient;

    beforeEach(() => {
      sendAmount = 50;
      recipient = 'some-fake-address';
      tx = wallet.createTransaction(recipient, sendAmount, txPool);
    });

    it('can create a new tx', () => {
      expect(txPool.getExistingTx(wallet.publicKey)).toEqual(tx);
    });

    describe('and creating the same tx again', () => {
      beforeEach(() => {
        wallet.createTransaction(recipient, sendAmount, txPool);
      });

      it('doubles the `sendAmount` substracted from the wallet balance', () => {
        expect(
          tx.outputs.find(output => output.address === wallet.publicKey).amount
        ).toEqual(wallet.balance - sendAmount * 2);
      });

      it('clones the `sendAmount` output for the recipient', () => {
        expect(
          tx.outputs
            .filter(output => output.address === recipient)
            .map(output => output.amount)
        ).toEqual([sendAmount, sendAmount]);
      });
    });
  });
});
