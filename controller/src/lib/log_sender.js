import { getEnv } from '../util.js';
import { polledSend } from './ws_server.js';

export async function sendLogToNode(wsURL, logData) {
  await polledSend(wsURL, {
    name: 'receive_log',
    sender: getEnv('NAME'),
    log: logData,
  });

  console.log('Successfully sent log to node %s.', wsURL);
}

export async function sendLogToOthers(logData) {
  const selfName = getEnv('NAME');
  const peerURLs = getEnv('PEER_CONTROLLER_HOSTS').split(',');

  await Promise.allSettled(
    peerURLs.map(url =>
      polledSend(url, {
        name: 'receive_log',
        sender: selfName,
        log: logData,
      }),
    ),
  );

  console.log('Successfully sent log to all other nodes.');
}
