import { getEnv } from '../util.js';
import { deleteEntry, insertEntry, updateEntry } from './db_connection.js';
import { log, writeLog as writeWholeLog } from './log.js';

export function resolveOtherLog(otherLog) {
  const lastEntry = log[log.length - 1];
  const otherLastCommonEntry = otherLog[log.length - 1];

  if (lastEntry.gameId === otherLastCommonEntry.gameId) {
    resolveLastCommonEntryForSameRow(lastEntry, otherLastCommonEntry);
  } else if (isEntryRelevant(otherLastCommonEntry)) {
    resolveNewEntries([otherLastCommonEntry]);
  }

  const newEntries = otherLog.slice(log.length);
  resolveNewEntries(newEntries);
}

function isEntryRelevant(entry) {
  return (
    getEnv('NAME') === 'central' ||
    (getEnv('NAME') === 'old' && entry.values.year < 2010) ||
    (getEnv('NAME') === 'new' && entry.values.year >= 2010)
  );
}

function resolveLastCommonEntryForSameRow(lastEntry, otherLastCommonEntry) {
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
    updateEntry(otherLastCommonEntry.gameId, otherLastCommonEntry.values);
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
    deleteEntry(otherLastCommonEntry.gameId);

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

function resolveNewEntries(newEntries) {
  for (const entry of newEntries) {
    if (!isEntryRelevant(entry)) {
      continue;
    }

    switch (entry.type) {
      case 'delete':
        log.push(entry);
        deleteEntry(entry.gameId);
        break;

      case 'insert':
        log.push(entry);
        insertEntry(entry.gameId, entry.values);
        break;

      case 'update':
        log.push(entry);
        updateEntry(entry.gameId, entry.values);
        break;
    }
  }

  writeWholeLog();
}