import mysql from 'mysql2/promise';

export class DBConnection {
  constructor(host, port) {
    this._host = host;
    this._port = port;

    this.connection = null;
  }

  close() {
    if (!this.connection) {
      throw new Error('Cannot operation on uinitialized database connection!');
    }

    this.connection.end();
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: this._host,
      port: this._port,
      user: 'root',
      password: '12345678', // https://www.youtube.com/watch?v=KLVzYtTeNS8
      database: 'gamesdb',
    });
  }

  async deleteGame(gameId) {
    if (!this.connection) {
      throw new Error('Cannot operate on uninitialized database connection!');
    }

    const query = 'CALL delete_game(?)';
    const results = await this.connection.query(query, [gameId]);

    return results[0].affectedRows > 0;
  }

  async fetchGame(gameId) {
    if (!this.connection) {
      throw new Error('Cannot operate on uninitialized database connection!');
    }

    const query = 'SELECT * FROM games WHERE id = ?';
    const results = await this.connection.query(query, [gameId]);

    return results[0][0] || null;
  }

  async fetchGames(startRow, rowCount, nameFilter) {
    if (!this.connection) {
      throw new Error('Cannot operate on uninitialized database connection!');
    }

    const query = 'CALL fetch_games(?, ?, ?)';
    const results = await this.connection.query(query, [
      startRow,
      rowCount,
      nameFilter,
    ]);

    return results[0][0];
  }

  async insertGame(values) {
    if (!this.connection) {
      throw new Error('Cannot operate on uninitialized database connection!');
    }

    const query = 'CALL insert_game(?, ?, ?, ?, ?, ?);';
    const results = await this.connection.query(query, [
      values?.id,
      values.name,
      values.release_date,
      values.price,
      values.positive_reviews,
      values.negative_reviews,
    ]);

    return results[0].affectedRows > 0;
  }

  async updateGame(values) {
    if (!this.connection) {
      throw new Error('Cannot operate on uninitialized database connection!');
    }

    const query = 'CALL edit_game(?, ?, ?, ?, ?, ?);';
    const results = await this.connection.query(query, [
      values.id,
      values.name,
      values.release_date,
      values.price,
      values.positive_reviews,
      values.negative_reviews,
    ]);

    return results[0].affectedRows > 0;
  }
}
