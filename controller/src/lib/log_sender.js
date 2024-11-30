import { getEnv } from '../util.js';
import { WebSocket } from 'ws';

export async function sendLogToOthers(logData) {
  const selfName = getEnv('NAME');
  const peerURLs = getEnv('PEER_CONTROLLER_HOSTS').split(',');

  await Promise.allSettled(
    peerURLs.map(url =>
      pollSend(url, {
        name: 'receive_log',
        sender: selfName,
        log: logData,
      }),
    ),
  );

  console.log('Successfully sent log to all other nodes.');
}

function pollSend(wsUrl, message, maxRetries = 30, pollingInterval = 2000) {
  let retryCount = 1;

  return new Promise(resolve => {
    function attemptSend() {
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

        if (retryCount >= maxRetries) {
          console.error(`Max retries reached for ${wsUrl}. Giving up.`);
          resolve(false);
        }

        console.warn(
          `Connection refused for ${wsUrl}. Retrying... (${retryCount}/${maxRetries})`,
        );

        retryCount++;
        setTimeout(attemptSend, pollingInterval);
      });
    }

    attemptSend();
  });
}
