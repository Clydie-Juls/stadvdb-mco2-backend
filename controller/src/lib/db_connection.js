import mysql from 'mysql2';

let db;

export function initDBConnection(host, port, user, password, database) {
  db = mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  // TODO: Finalize connection
  db.connect();
}

// TODO: Perhaps use the stored procedures made

export function deleteEntry(gameId) {
  const query = 'DELETE FROM games WHERE gameId = ?';

  db.query(query, [gameId], err => {
    if (err) throw err;
    console.log(`Deleted entry with gameId: ${gameId}`);
  });
}

export function insertEntry(gameId, values) {
  const query = 'INSERT INTO games (gameId, values) VALUES (?, ?)';

  db.query(query, [gameId, JSON.stringify(values)], err => {
    if (err) throw err;
    console.log(`Inserted entry with gameId: ${gameId}`);
  });
}

export function updateEntry(gameId, values) {
  const query = 'UPDATE games SET values = ? WHERE gameId = ?';

  db.query(query, [JSON.stringify(values), gameId], err => {
    if (err) throw err;
    console.log(`Updated entry with gameId: ${gameId}`);
  });
}
