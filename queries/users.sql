
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  auth_sub varchar(255) NOT NULL, 
  auth_provider varchar(255) NOT NULL, 
  auth_sub_id varchar(255) NOT NULL
);
INSERT IGNORE INTO users
    (
        auth_sub, auth_provider, auth_sub_id
    )
VALUES
    ("google-oauth2|114786418891393004130", "google-oauth2", "114786418891393004130");

DROP TABLE tenant;
CREATE TABLE tenant (
  auth_sub varchar(255) NOT NULL, 
  auth_provider varchar(255) NOT NULL, 
  auth_sub_id varchar(255) NOT NULL,
  board_id varchar(255) NOT NULL,
  user_id varchar(255) NOT NULL,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (auth_sub, board_id, user_id) 
);