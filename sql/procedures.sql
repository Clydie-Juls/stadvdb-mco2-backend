DROP PROCEDURE IF EXISTS fetch_games;
DROP PROCEDURE IF EXISTS fetch_games_lt_year;
DROP PROCEDURE IF EXISTS fetch_games_gte_year;
DROP PROCEDURE IF EXISTS edit_game;
DROP PROCEDURE IF EXISTS delete_game;
DROP PROCEDURE IF EXISTS count_games;
DROP PROCEDURE IF EXISTS average_positive_reviews;
DROP PROCEDURE IF EXISTS average_negative_reviews;
DROP PROCEDURE IF EXISTS average_price;

DELIMITER //

CREATE PROCEDURE fetch_games(
  IN start_row INT, 
  IN row_count INT 
)
BEGIN
  SELECT * FROM games
  LIMIT start_row, row_count;
END //

CREATE PROCEDURE fetch_games_lt_year(
  IN start_row INT, 
  IN row_count INT,
  IN year_partition INT
)
BEGIN
  SELECT * FROM games
  WHERE YEAR(release_date) < year_partition
  LIMIT start_row, row_count;
END //

CREATE PROCEDURE fetch_games_gte_year(
  IN start_row INT, 
  IN row_count INT,
  IN year_partition INT
)
BEGIN
  SELECT * FROM games
  WHERE YEAR(release_date) >= year_partition
  LIMIT start_row, row_count;
END //

CREATE PROCEDURE edit_game(
  IN id INT, 
  IN title VARCHAR(255), 
  IN genre VARCHAR(255), 
  IN release_date DATE, 
  IN price DECIMAL(10, 2)
)
BEGIN
  UPDATE games
  SET title = title, genre = genre, release_date = release_date, price = price
  WHERE game_id = id;
END //

CREATE PROCEDURE delete_game(IN id INT)
BEGIN
  DELETE FROM games WHERE game_id = id;
END //

CREATE PROCEDURE count_games()
BEGIN
  SELECT COUNT(*) AS total_games FROM games;
END //

CREATE PROCEDURE average_positive_reviews()
BEGIN
  SELECT AVG(positive_reviews) AS positive_reviews FROM games;
END //

CREATE PROCEDURE average_negative_reviews()
BEGIN
  SELECT AVG(negative_reviews) AS negative_reviews FROM games;
END //

CREATE PROCEDURE average_price()
BEGIN
  SELECT AVG(price) AS average_price FROM games;
END //

DELIMITER ;