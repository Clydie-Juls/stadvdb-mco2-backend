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
import cors from 'cors';
import express from 'express';

const MYSQL_HOST = getEnv('MY_SQL_HOST');
const MYSQL_PORT = getEnv('MY_SQL_PORT');
const CONTROLLER_PORT = getEnv('CONTROLLER_PORT');

const app = express();

app.use(cors());
app.use(express.json());

// Fetch games
app.get('/games', async (req, res) => {
  const startRow = req.query.start_row ? Number(req.query.start_row) : 0;
  const rowCount = req.query.row_count ? Number(req.query.row_count) : 10;
  const nameFilter = req.query.name_filter ?? '';

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const results = await db.fetchGames(startRow, rowCount, nameFilter);
  db.close();

  res.send(results);
});

app.get('/games/count', async (req, res) => {
  const nameFilter = req.query.name_filter ?? '';

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const count = await db.countGames(nameFilter);
  db.close();

  res.send({ count });
});

app.get('/games/avg-pos-reviews', async (req, res) => {
  const nameFilter = req.query.name_filter ?? '';

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const result = await db.fetchAvgPosReviews(nameFilter);
  db.close();

  res.send(result);
});

app.get('/games/avg-neg-reviews', async (req, res) => {
  const nameFilter = req.query.name_filter ?? '';

  const db = new DBConnection(MYSQL_HOST, MYSQL_PORT);
  await db.connect();

  const result = await db.fetchAvgNegReviews(nameFilter);
  db.close();

  res.send(result);
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

  handleDelete(gameData);

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
