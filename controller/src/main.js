import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', ws => {
  ws.on('message', message => {
    ws.send(`Echo: ${message}`);
  });

  ws.send('Welcome to the WebSocket server!');
});
