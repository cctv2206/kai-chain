const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain/blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool')
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3001;


const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const txPool = new TransactionPool();
const p2pServer = new P2pServer(bc, txPool);
const miner = new Miner(bc, txPool, wallet, p2pServer);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);

  p2pServer.syncChains();

  res.redirect('/blocks');
});

app.get('/transactions', (req, res) => {
  res.json(txPool.transactions);
});

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const tx = wallet.createTransaction(recipient, amount, bc, txPool);

  p2pServer.broadcastTx(tx);

  res.redirect('/transactions');
});

app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);

  res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}.`);
});

p2pServer.listen();
