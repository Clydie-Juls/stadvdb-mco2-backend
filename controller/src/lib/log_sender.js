import { getEnv } from '../util.js';
import { getPeersWS } from './ws_server.js';

export async function sendLogToOthers(logData) {
  const selfName = getEnv('NAME');
  const peerSockets = await getPeersWS();

  for (const ws of peerSockets) {
    pollSend(ws, {
      name: 'receive_log',
      sender: selfName,
      log: logData,
    });
  }

  console.log('Sent log to all other nodes.');
}

function pollSend(ws, message, maxRetries = 30, pollingInterval = 2000) {
  let retryCount = 1;

  // Send the initial message immediately
  ws.send(JSON.stringify(message));

  ws.on('error', error => {
    console.warn('WebSocket error:', error);

    if (retryCount < maxRetries) {
      retryCount++;
      console.warn(`Retrying (${retryCount}/${maxRetries})`);

      const delayedSend = () => {
        ws.send(JSON.stringify(message));
        setTimeout(delayedSend, pollingInterval);
      };

      setTimeout(delayedSend, pollingInterval);
    } else {
      console.error('Max retries reached. Giving up.');
    }
  });
}
