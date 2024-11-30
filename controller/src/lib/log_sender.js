import { getPeersWS } from './ws_server.js';

export async function sendLogToOthers(logData, wsURL) {
  const peers = await getPeersWS();

  for (const peer of peers) {
    pollSend(peer, wsURL, {
      sender: wsURL,
      log: logData,
    });
  }

  console.log('Sent log to all other nodes.');
}

function pollSend(
  peer,
  wsURL,
  logData,
  maxRetries = 30,
  pollingInterval = 2000,
) {
  let retryCount = 1;

  // Send the initial message immediately
  peer.send({
    sender: wsURL,
    log: logData,
  });

  peer.on('error', error => {
    console.warn('WebSocket error:', error);

    if (retryCount < maxRetries) {
      retryCount++;
      console.warn(`Retrying (${retryCount}/${maxRetries})`);

      const delayedSend = () => {
        peer.send({
          sender: wsURL,
          log: logData,
        });
        setTimeout(delayedSend, pollingInterval);
      };

      setTimeout(delayedSend, pollingInterval);
    } else {
      console.error('Max retries reached. Giving up.');
    }
  });
}
