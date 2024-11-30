import { getEnv } from '../util.js';
import { attemptSend } from './ws_server.js';

export async function pullLogFromPeer() {
  const selfName = getEnv('NAME');
  const selfURL = `${getEnv('CONTROLLER_URL')}:${getEnv('CONTROLLER_PORT')}`;
  const peerURLs = getEnv('PEER_CONTROLLER_HOSTS').split(',');

  for (const url of peerURLs) {
    await attemptSend(url, {
      name: 'fetch_log',
      sender: selfName,
      senderUrl: selfURL,
    });
  }
}
