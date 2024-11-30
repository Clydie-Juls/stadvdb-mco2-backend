import { randomUUID } from 'crypto';
import fs from 'fs';

const LOG_FILE_PATH = './log.json';

export const log = [];

export function initLog() {
  if (fs.existsSync(LOG_FILE_PATH)) {
    const fileContents = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
    Object.assign(log, JSON.parse(fileContents));

    console.log('Log loaded from log.json.');
  } else {
    console.warn('No log file found, starting fresh.');
  }
}

export function writeLog() {
  fs.writeFileSync('./log.json', JSON.stringify(log));
}

export function writeToLog(type, time, values) {
  log.push({ uuid: randomUUID(), type, time, gameId: values.id, values });
  writeLog();
}
