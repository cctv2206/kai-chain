const Wallet = require('../wallet');
const Transaction = require('../wallet/transction');

class Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.txPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    const validTxs = this.txPool.validTransactions();

    // include a reward for the Miner
    validTxs.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );

    // create a block consisting of valid transactions
    const block = this.blockchain.addBlock(validTxs);

    // synchronize the chains in the peer-to-peer server
    this.p2pServer.syncChains();

    // clear the transaction pool
    this.txPool.clear();

    // broadcast to every miner to clear their transaction pools
    this.p2pServer.broadcastClearTx();

    return block;
  }
}

module.exports = Miner;
