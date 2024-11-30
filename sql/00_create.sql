DROP DATABASE IF EXISTS `gamesdb`;

CREATE DATABASE IF NOT EXISTS `gamesdb`;
USE `gamesdb`;

DROP TABLE IF EXISTS games;
CREATE TABLE games (
  id int AUTO_INCREMENT PRIMARY KEY,
  name varchar(255),
  release_date date,
  price decimal(10, 2),
  positive_reviews int,
  negative_reviews int
);