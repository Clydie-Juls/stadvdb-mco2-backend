import { DBConnection } from './lib/DBConnection.js';
import { initLog } from './lib/log.js';
import { pullLogFromPeer } from './lib/log_puller.js';
import {
  handleDelete,
  handleInsert,
  handleUpdate,
} from './lib/write_handlers.js';
import { initWSServer } from './lib/ws_server.js';
import { getEnv } from './util.js';
import express from 'express';

const MYSQL_HOST = getEnv('MY_SQL_HOST');
const MYSQL_PORT = getEnv('MY_SQL_PORT');
const CONTROLLER_PORT = getEnv('CONTROLLER_PORT');

const app = express();

app.use(express.json());

// Fetch games
app.get('/games', async (req, res) => {
  const startRow = req.query.start_row ?? 0;
  const rowCount = req.query.row_count ?? 10;
  const nameFilter = req.query.name_filter ?? '';

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const results = await db.fetchGames(startRow, rowCount, nameFilter);
  db.close();

  res.send(results);
});

// Count all games
app.get('/games/count', async (req, res) => {
  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const count = await db.countGames();
  db.close();

  res.send({ count });
});

// Fetch a single game
app.get('/games/:id', async (req, res) => {
  const gameId = req.params.id;

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const game = await db.fetchGame(gameId);
  db.close();

  res.send({ game });
});

// Insert a game
app.post('/games', async (req, res) => {
  const gameData = req.body;

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const success = await db.insertGame(gameData);
  db.close();

  handleInsert(gameData);

  res.send(success);
});

// Update a game
app.put('/games', async (req, res) => {
  const gameData = req.body;

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const success = await db.updateGame(gameData);
  db.close();

  handleUpdate(gameData);

  res.send(success);
});

// Delete a game
app.delete('/games', async (req, res) => {
  const gameData = req.body;

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const success = await db.deleteGame(gameData.id);
  db.close();

  handleDelete(gameData.id);

  res.send(success);
});

const httpServer = app.listen(CONTROLLER_PORT, () => {
  const NAME = getEnv('NAME');

  console.log('Hello! I am %s!\n', NAME);
  console.log(`Server is running at port ${CONTROLLER_PORT}.`);

  initWSServer(httpServer);

  initLog();
  pullLogFromPeer();
});
