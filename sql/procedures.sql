USE `gamesdb`;

DROP PROCEDURE IF EXISTS fetch_games;
DROP PROCEDURE IF EXISTS fetch_games_lt_year;
DROP PROCEDURE IF EXISTS fetch_games_gte_year;
DROP PROCEDURE IF EXISTS insert_game;
DROP PROCEDURE IF EXISTS edit_game;
DROP PROCEDURE IF EXISTS delete_game;
DROP PROCEDURE IF EXISTS count_games;
DROP PROCEDURE IF EXISTS average_positive_reviews;
DROP PROCEDURE IF EXISTS average_negative_reviews;
DROP PROCEDURE IF EXISTS average_price;

DELIMITER //

CREATE PROCEDURE fetch_games(
  IN start_row INT, 
  IN row_count INT,
  IN name_filter VARCHAR(255) 
)
BEGIN
  SELECT * FROM games
  WHERE games.name LIKE CONCAT("%", name_filter, "%")
  LIMIT start_row, row_count;
END //

CREATE PROCEDURE fetch_games_lt_year(
  IN start_row INT, 
  IN row_count INT,
  IN year_partition INT,
  IN name_filter VARCHAR(255) 
)
BEGIN
  SELECT * FROM games
  WHERE YEAR(release_date) < year_partition AND games.name LIKE CONCAT("%", name_filter, "%")
  LIMIT start_row, row_count;
END //

CREATE PROCEDURE fetch_games_gte_year(
  IN start_row INT, 
  IN row_count INT,
  IN year_partition INT,
  IN name_filter VARCHAR(255) 
)
BEGIN
  SELECT * FROM games
  WHERE YEAR(release_date) >= year_partition AND games.name LIKE CONCAT("%", name_filter, "%")
  LIMIT start_row, row_count;
END //

CREATE PROCEDURE insert_game(
  IN id VARCHAR(64),
  IN name VARCHAR(255), 
  IN release_date DATE, 
  IN price DECIMAL(10, 2),
  IN positive_reviews int,
  IN negative_reviews int 
)
BEGIN
  IF id IS NULL THEN
    SET id = UUID();
  END IF;

  INSERT INTO games (id, name, release_date, price, positive_reviews, negative_reviews)
  VALUES (id, name, release_date, price, positive_reviews, negative_reviews);
END //

CREATE PROCEDURE edit_game(
  IN id VARCHAR(64), 
  IN name VARCHAR(255), 
  IN release_date DATE, 
  IN price DECIMAL(10, 2),
  IN positive_reviews int,
  IN negative_reviews int
)
BEGIN
  UPDATE games
  SET name = name, release_date = release_date, price = price, positive_reviews = positive_reviews, negative_reviews = negative_reviews
  WHERE games.id = id;
END //

CREATE PROCEDURE delete_game(IN id VARCHAR(64))
BEGIN
  DELETE FROM games WHERE games.id = id;
END //

CREATE PROCEDURE count_games(IN name_filter VARCHAR(255))
BEGIN
  SELECT COUNT(*) AS total_games 
  FROM games
  WHERE games.name LIKE CONCAT("%", name_filter, "%");
END //

CREATE PROCEDURE average_positive_reviews(IN name_filter VARCHAR(255))
BEGIN
  SELECT AVG(positive_reviews) AS positive_reviews
  FROM games
  WHERE games.name LIKE CONCAT("%", name_filter, "%");
END //

CREATE PROCEDURE average_negative_reviews(IN name_filter VARCHAR(255))
BEGIN
  SELECT AVG(negative_reviews) AS negative_reviews  
  FROM games
  WHERE games.name LIKE CONCAT("%", name_filter, "%");
END //

CREATE PROCEDURE average_price()
BEGIN
  SELECT AVG(price) AS average_price FROM games;
END //

DELIMITER ;