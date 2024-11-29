import { WebSocketServer } from 'ws';

const MESSAGE_MAP = {
  acknowledge_log,
  receive_log,
  simulate_on,
  simulate_off,
};

// eslint-disable-next-line no-undef
const PORT = process.env.CONTROLLER_PORT || 8080;

console.log('Listening on port %d', PORT);

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const { name, ...args } = data;
    console.log('Received WS message: %s %s', name, JSON.stringify(args));

    const callback = MESSAGE_MAP[name];
    callback(args);
  });
});

// Message Handlers

function acknowledge_log({ sender }) {
  // tell polled sender
}

function receive_log({ sender, recentLines }) {
  // resolve log
}

function simulate_on() {}

function simulate_off() {}

// Trigger Handlers

function handleDeleteTrigger(time, gameId) {
  // log
  // send log
}

function handleInsertTrigger(time, gameId, values) {
  // log
  // send log
}

function handleUpdateTrigger(time, gameId, values) {
  // log
  // send log
}
