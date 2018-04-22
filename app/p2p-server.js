const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  tx: 'TX'
};

class P2pServer {
  constructor(blockchain, txPool) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.txPool = txPool;

    this.sendChain = this.sendChain.bind(this);
  }

  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));

    this.connectToPeers();

    console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
  }

  connectToPeers() {
    peers.forEach(peer => {
      // ws://localhost:5001
      const socket = new Websocket(peer);

      socket.on('open', () => this.connectSocket(socket));
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('Socket connected');

    this.messageHandler(socket);

    this.sendChain(socket);
  }

  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message);

      switch (data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.tx:
          this.txPool.updateOrAddTransaction(data.tx);
          break;
        default:
          console.log('unidentified message type');
      }
    });
  }

  sendChain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.chain,
        chain: this.blockchain.chain
      })
    );
  }

  sendTx(socket, tx) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.tx,
        tx: tx
      })
    );
  }

  syncChains() {
    this.sockets.forEach(this.sendChain);
  }

  broadcastTx(tx) {
    this.sockets.forEach(socket => this.sendTx(socket, tx));
  }
}

module.exports = P2pServer;
