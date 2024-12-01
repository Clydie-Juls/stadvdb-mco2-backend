import { initDBConnection } from './lib/db_connection.js';
import { initLog } from './lib/log.js';
import { initWSServer } from './lib/ws_server.js';
import { getEnv } from './util.js';

const NAME = getEnv('NAME');
const MYSQL_HOST = getEnv('MY_SQL_HOST');
const MYSQL_PORT = getEnv('MY_SQL_PORT');
const WS_PORT = getEnv('CONTROLLER_PORT');

if (!NAME || !MYSQL_HOST || !MYSQL_PORT || !WS_PORT) {
  throw new Error('Missing environment variables!');
}

console.log(`Hello! I am ${NAME}!`);

initLog();

initDBConnection(
  getEnv('MY_SQL_HOST'),
  getEnv('MY_SQL_PORT'),
  'user',
  'Ninja12345678', // https://www.youtube.com/watch?v=KLVzYtTeNS8
  'gamesdb',
);
initWSServer(WS_PORT);
