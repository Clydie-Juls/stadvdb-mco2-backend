import { writeToLog } from './log.js';
import { resolveOtherLog } from './log_resolver.js';
import { sendLogToOthers } from './log_sender.js';
import { sendWSMessage } from './ws_server.js';

const MESSAGE_MAP = {
  // Database Trigger Commands
  notify_delete,
  notify_insert,
  notify_update,

  // Log commands
  receive_log,

  // Simulation Commands
  simulate_on,
  simulate_off,
};

export function handleMessage({ name, args }) {
  const callback = MESSAGE_MAP[name];
  callback(args);
}

function notify_delete({ gameId, year }) {
  const time = Date.now();

  writeToLog('delete', time, gameId, { year });
  sendLogToOthers();

  console.log('Received table delete notification: %s %s', time, gameId);
}

function notify_insert({ gameId, values }) {
  const time = Date.now();

  writeToLog('insert', time, gameId, values);
  sendLogToOthers();

  console.log('Received table insert notification: %s %s', time, gameId);
}

function notify_update({ gameId, values }) {
  const time = Date.now();

  writeToLog('update', time, gameId, values);
  sendLogToOthers();

  console.log('Received table update notification: %s %s', time, gameId);
}

function receive_log({ sender, log }) {
  resolveOtherLog(log);
  sendWSMessage(sender, 'acknowledge_log');

  console.log('Received and resolved log from %s', sender);
}

function simulate_on() {
  console.warn('Simulating server on!');

  // exec function to stop mysql server
}

function simulate_off() {
  console.warn('Simulating server off!');

  // exec function to start mysql server
}
