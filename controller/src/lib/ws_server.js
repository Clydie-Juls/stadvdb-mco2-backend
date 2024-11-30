import { handleMessage } from './message_handler.js';
import { WebSocketServer, WebSocket } from 'ws';

let wss;

export function initWSServer(port) {
  wss = new WebSocketServer({ port });

  wss.once('listening', () => {
    console.log('Listening on port %d', port);
  });

  wss.on('connection', function connection(ws) {
    console.log('New ws connection from %s', ws._socket.remoteAddress);

    ws.on('error', console.error);

    ws.on('message', function message(data, isBinary) {
      const message = isBinary ? data : data.toString();
      const { name, ...args } = JSON.parse(message);
      console.log('Received WS message: %s %s', name, JSON.stringify(args));

      handleMessage(name, args);
    });

    ws.on('close', function close() {
      console.log('Closed ws connection from %s', ws._socket.remoteAddress);
    });
  });
}

export function attemptSend(wsUrl, message) {
  return new Promise(resolve => {
    const ws = new WebSocket(wsUrl);

    ws.once('open', () => {
      ws.send(JSON.stringify(message));
      ws.ping(); // Extra step to ensure the message is sent
    });

    ws.once('pong', () => {
      resolve(true);
      ws.close();
    });

    ws.on('error', e => {
      if (e.code !== 'ECONNREFUSED') {
        throw e;
      }

      resolve(false);
    });
  });
}

export function polledSend(
  wsUrl,
  message,
  maxRetries = 30,
  pollingInterval = 2000,
) {
  let retryCount = 1;

  return new Promise(resolve => {
    async function wrappedAttemptSend() {
      const success = attemptSend(wsUrl, message);

      if (success) {
        resolve(true);
        return;
      }

      if (retryCount >= maxRetries) {
        console.error(`Max retries reached for ${wsUrl}. Giving up.`);
        resolve(false);
      }

      console.warn(
        `Connection refused for ${wsUrl}. Retrying... (${retryCount}/${maxRetries})`,
      );

      retryCount++;
      setTimeout(wrappedAttemptSend, pollingInterval);
    }

    wrappedAttemptSend();
  });
}
