import mysql from 'mysql2';

let db;

export function initDBConnection(host, port, user, password, database) {
  db = mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: {
    rejectUnauthorized: true // Ensures the server's certificate is validated
  }
  });

  // TODO: Finalize connection
  db.connect();
}

export function deleteEntry(gameId) {
  const query = 'CALL delete_game(?)';

  db.query(query, [gameId], err => {
    if (err) throw err;
    console.log(`Deleted entry with gameId: ${gameId}`);
  });
}

export function insertEntry(values) {
  const query = 'CALL insert_game(?, ?, ?, ?, ?);';

  db.query(
    query,
    [
      values.name,
      values.release_date,
      values.price,
      values.positive_reviews,
      values.negative_reviews,
    ],
    err => {
      if (err) throw err;
      console.log(`Inserted entry with name: ${values.name}`);
    },
  );
}

export function updateEntry(gameId, values) {
  const query = 'CALL edit_game(?, ?, ?, ?, ?, ?);';

  db.query(
    query,
    [
      gameId,
      values.name,
      values.release_date,
      values.price,
      values.positive_reviews,
      values.negative_reviews,
    ],
    err => {
      if (err) throw err;
      console.log(`Updated entry with gameId: ${gameId}`);
    },
  );
}
