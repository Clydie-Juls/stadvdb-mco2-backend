import { getEnv } from '../util.js';
import { handleMessage } from './message_handler.js';
import { WebSocketServer } from 'ws';

let wss;

export function initWSServer(port) {
  wss = new WebSocketServer({ port });

  wss.once('listening', () => {
    console.log('Listening on port %d', port);
  });

  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data, isBinary) {
      const message = isBinary ? data : data.toString();
      const { name, ...args } = JSON.parse(message);
      console.log('Received WS message: %s %s', name, JSON.stringify(args));

      handleMessage(name, args);
    });
  });
}

export function getPeersWS() {
  const peers = [];
  const peersURL = getEnv('PEER_URLS').split(',');

  for (const peerURL of peersURL) {
    const ws = new WebSocket(peerURL);
    peers.push(ws);
  }

  return peers;
}

export function sendWSMessage(sender, name, values = {}) {
  const ws = new WebSocket(sender);

  ws.send(
    JSON.stringify({
      name,
      sender: `${getEnv('CONTROLLER_URL')}/${getEnv('CONTROLLER_PORT')}`,
      ...values,
    }),
  );
  ws.close();
}
