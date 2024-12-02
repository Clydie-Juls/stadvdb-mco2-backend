import { getEnv } from '../util.js';
import { DBConnection } from './DBConnection.js';
import { log, writeToLog } from './log.js';
import { sendLogToOthers } from './log_sender.js';

const MYSQL_HOST = getEnv('MY_SQL_HOST');
const MYSQL_PORT = getEnv('MY_SQL_PORT');

export function handleDelete({ id, release_date }) {
  const time = Date.now();

  writeToLog('delete', time, { id, release_date });
  sendLogToOthers(log);

  console.log('Received table delete notification: %s %s', time, id);
}

export function handleInsert(values) {
  const time = Date.now();

  writeToLog('insert', time, values);
  sendLogToOthers(log);

  console.log('Received table insert notification: %s %s', time, values.id);
}

export async function handleUpdate(values) {
  const time = Date.now();

  writeToLog('update', time, values);
  sendLogToOthers(log);

  console.log('Received table update notification: %s %s', time, values.id);

  const nextYear = Number(values.release_date.split('-')[0]);

  if (
    (getEnv('NAME') === 'new' && nextYear < 2010) ||
    (getEnv('NAME') === 'old' && nextYear >= 2010)
  ) {
    const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
    await db.connect();

    await db.deleteGame(values.id);
    console.log('Partition change for entry with id %s', values.id);

    db.close();
  }
}
