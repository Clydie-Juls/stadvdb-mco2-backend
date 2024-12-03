import { getEnv } from '../util.js';
import { DBConnection } from './DBConnection.js';
import { log, writeLog as writeWholeLog } from './log.js';

const MYSQL_HOST = getEnv('MY_SQL_HOST');
const MYSQL_PORT = getEnv('MY_SQL_PORT');

export function resolveOtherLog(otherLog) {
  if (log.length > 0) {
    const lastEntry = log[log.length - 1];
    const otherLastCommonEntry = otherLog[log.length - 1];

    if (lastEntry.uuid !== otherLastCommonEntry.uuid) {
      if (lastEntry.gameId === otherLastCommonEntry.gameId) {
        resolveLastCommonEntryForSameRow(lastEntry, otherLastCommonEntry);
      } else if (isEntryRelevant(otherLastCommonEntry)) {
        resolveNewEntries([otherLastCommonEntry]);
      }
    }
  }

  const newEntries = otherLog.slice(log.length);
  resolveNewEntries(newEntries);
}

function isEntryRelevant(entry) {
  const year = Number(entry.values.release_date.split('-')[0]);

  return (
    getEnv('NAME') === 'central' ||
    (getEnv('NAME') === 'old' && year < 2010) ||
    (getEnv('NAME') === 'new' && year >= 2010)
  );
}

async function resolveLastCommonEntryForSameRow(
  lastEntry,
  otherLastCommonEntry,
) {
  if (lastEntry.type === 'update' && otherLastCommonEntry.type === 'update') {
    log.push(otherLastCommonEntry);

    // Place the updates in the correct order should the received update entry be
    // older than the newest entry. Do not touch the database anymore since the
    // current last entry is newer.
    if (lastEntry.time > otherLastCommonEntry.time) {
      log.sort((a, b) => a.time - b.time);
      return;
    }

    // Else, update the entry in the database should the received entry be newer.
    const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
    await db.connect();
    await db.updateGame(otherLastCommonEntry.values);
    db.close();
  } else if (
    lastEntry.type === 'delete' &&
    otherLastCommonEntry.type === 'delete'
  ) {
    // Don't repeat the same delete operation should the received entry be newer.
    if (lastEntry.time < otherLastCommonEntry.time) {
      return;
    }

    // Else, the deletion actually occurred ealier than what is recorded in the
    // current node, so discard the current entry and use the received entry instead.
    log.pop();
    log.push(otherLastCommonEntry);
  } else if (
    lastEntry.type === 'update' &&
    otherLastCommonEntry.type === 'delete'
  ) {
    const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
    await db.connect();
    await db.deleteGame(otherLastCommonEntry.gameId);
    db.close();

    // If the deletion occurred before the update from the other node, invalidate
    // the update entry.
    if (lastEntry.time > otherLastCommonEntry.time) {
      log.pop();
    }

    log.push(otherLastCommonEntry);
  } else if (
    lastEntry.type === 'delete' &&
    otherLastCommonEntry.type === 'update'
  ) {
    // If the deletion occurred before the update from the other node, invalidate
    // the update entry.
    if (lastEntry.time < otherLastCommonEntry.time) {
      return;
    }

    log.push(otherLastCommonEntry);
    log.sort((a, b) => a.time - b.time);
  } else {
    throw new Error('Resolver reached an unexpected state.');
  }

  writeWholeLog();
}

async function resolveNewEntries(newEntries) {
  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  for (const entry of newEntries) {
    if (!isEntryRelevant(entry)) {
      log.push(entry);
      log.sort((a, b) => a.time - b.time);

      //
      if (entry.type === 'update' && (await db.fetchGame(entry.gameId))) {
        await db.deleteGame(entry.gameId);
      }

      writeWholeLog();
      continue;
    }

    switch (entry.type) {
      case 'delete':
        log.push(entry);
        await db.deleteGame(entry.gameId);
        break;

      case 'insert':
        log.push(entry);
        await db.insertGame(entry.values);
        break;

      case 'update':
        {
          log.push(entry);

          if (getEnv('NAME') === 'central') {
            await db.updateGame(entry.values);
            break;
          }

          //
          if (!(await db.fetchGame(entry.gameId))) {
            await db.insertGame(entry.values);
          } else {
            await db.updateGame(entry.values);
          }
        }

        break;
    }
  }

  db.close();
  writeWholeLog();
}
