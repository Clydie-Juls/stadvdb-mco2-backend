import { getEnv } from '../util.js';
import { attemptSend } from './ws_server.js';

export async function pullLogFromPeer() {
  console.log(`controller: ${getEnv('CONTROLLER_URL')}`);
  const selfName = getEnv('NAME');
  const selfURL = `${getEnv('CONTROLLER_URL')}${getEnv('CONTROLLER_PORT') ? ':' + getEnv('CONTROLLER_PORT') : ''}`;
  const peerURLs = getEnv('PEER_CONTROLLER_HOSTS').split(',');

  for (const url of peerURLs) {
    const success = await attemptSend(url, {
      name: 'fetch_log',
      sender: selfName,
      senderUrl: selfURL,
    });

    if (success) {
      break;
    }
  }
}
