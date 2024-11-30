import { log, writeToLog } from './log.js';
import { resolveOtherLog } from './log_resolver.js';
import { sendLogToNode, sendLogToOthers } from './log_sender.js';

const MESSAGE_MAP = {
  // Database Trigger Commands
  notify_delete,
  notify_insert,
  notify_update,

  // Log commands
  fetch_log,
  receive_log,

  // Simulation Commands
  simulate_on,
  simulate_off,
};

export function handleMessage(name, args) {
  const callback = MESSAGE_MAP[name];

  if (!callback) {
    console.warn('Received unknown message: %s', name);
    return;
  }

  callback(args);
}

function notify_delete({ values: { id, release_date } }) {
  const time = Date.now();

  writeToLog('delete', time, { id, release_date });
  sendLogToOthers(log);

  console.log('Received table delete notification: %s %s', time, id);
}

function notify_insert({ values }) {
  const time = Date.now();

  writeToLog('insert', time, values);
  sendLogToOthers(log);

  console.log('Received table insert notification: %s %s', time, values.id);
}

function notify_update({ values }) {
  const time = Date.now();

  writeToLog('update', time, values);
  sendLogToOthers(log);

  console.log('Received table update notification: %s %s', time, values.id);
}

function fetch_log({ sender, senderUrl, log }) {
  sendLogToNode(senderUrl, log);

  console.log('Received log fetch request from %s', sender);
}

function receive_log({ sender, log }) {
  resolveOtherLog(log);

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
