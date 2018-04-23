const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain/blockchain');
const { INITIAL_BALANCE } = require('../config');

describe('Wallet test', () => {
  let wallet, txPool, bc, miner;

  beforeEach(() => {
    wallet = new Wallet();
    txPool = new TransactionPool();
    bc = new Blockchain();
  });

  describe('creating a tx', () => {
    let tx, sendAmount, recipient;

    beforeEach(() => {
      sendAmount = 50;
      recipient = 'some-fake-address';
      tx = wallet.createTransaction(recipient, sendAmount, bc, txPool);
    });

    it('can create a new tx', () => {
      expect(txPool.getExistingTx(wallet.publicKey)).toEqual(tx);
    });

    describe('and creating the same tx again', () => {
      beforeEach(() => {
        wallet.createTransaction(recipient, sendAmount, bc, txPool);
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

  describe('calculating a balance', () => {
    let senderWallet, addBalance, repeatAdd;

    beforeEach(() => {
      senderWallet = new Wallet();
      addBalance = 50;
      repeatAdd = 3;

      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(
          wallet.publicKey,
          addBalance,
          bc,
          txPool
        );
      }
      bc.addBlock(txPool.transactions);
    });

    it('calculates the balance for blockchain transactions matching the recipient', () => {
      expect(wallet.calculateBalance(bc)).toEqual(
        INITIAL_BALANCE + addBalance * repeatAdd
      );
    });

    it('calculates the balance for blockchain transactions matching the sender', () => {
      expect(senderWallet.calculateBalance(bc)).toEqual(
        INITIAL_BALANCE - addBalance * repeatAdd
      );
    });

    describe('and the recipient conducts a transaction', () => {
      let substractBalance, recipientBalance;

      beforeEach(() => {
        // manually clear the pool
        txPool.clear();
        substractBalance = 60;
        recipientBalance = wallet.calculateBalance(bc);
        wallet.createTransaction(
          senderWallet.publicKey,
          substractBalance,
          bc,
          txPool
        );
        bc.addBlock(txPool.transactions);
      });

      describe('and the sender sends another transaction to the recipient', () => {
        beforeEach(() => {
          txPool.clear();
          senderWallet.createTransaction(
            wallet.publicKey,
            addBalance,
            bc,
            txPool
          );
          bc.addBlock(txPool.transactions);
        });

        it('calculates the recipient balance only using transactions since its most recent one', () => {
          expect(wallet.calculateBalance(bc)).toEqual(
            recipientBalance - substractBalance + addBalance
          );
        });
      });
    });
  });
});
