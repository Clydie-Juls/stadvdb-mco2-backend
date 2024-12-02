import { log } from './log.js';
import { resolveOtherLog } from './log_resolver.js';
import { sendLogToNode } from './log_sender.js';

const MESSAGE_MAP = {
  // Log commands
  fetch_log,
  receive_log,
};

export function handleMessage(name, args) {
  const callback = MESSAGE_MAP[name];

  if (!callback) {
    console.warn('Received unknown message: %s', name);
    return;
  }

  callback(args);
}

function fetch_log({ sender, senderUrl }) {
  sendLogToNode(senderUrl, log);

  console.log('Received log fetch request from %s', sender);
}

function receive_log({ sender, log }) {
  resolveOtherLog(log);

  console.log('Received and resolved log from %s', sender);
}
