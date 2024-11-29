import { initDBConnection } from './lib/db_connection';
import { initLog } from './lib/log';
import { initWSServer } from './lib/ws_server';
import { getEnv } from './util';

const MYSQL_HOST = getEnv('MY_SQL_HOST');
const MYSQL_PORT = getEnv('MY_SQL_PORT');
const WS_PORT = getEnv('CONTROLLER_PORT');

if (!MYSQL_HOST || !MYSQL_PORT || !WS_PORT) {
  throw new Error('Missing environment variables!');
}

initLog();

initDBConnection(
  getEnv('MY_SQL_HOST'),
  getEnv('MY_SQL_PORT'),
  'root',
  '12345678', // https://www.youtube.com/watch?v=KLVzYtTeNS8
  'gamesdb',
);
initWSServer(WS_PORT);
