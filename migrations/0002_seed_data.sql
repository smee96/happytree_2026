-- 농장 설정 데이터 삽입

INSERT INTO farm_configs (farm_id, name, unlock_condition) VALUES
  (1, '농장 1', NULL),
  (2, '농장 2', 'farm_1_lv8'),
  (3, '농장 3', 'farm_2_lv8'),
  (4, '농장 4', 'farm_3_lv8');

-- 농장 1 레벨 설정
INSERT INTO level_configs (farm_id, level, required_stars, required_heart_allowance, reward_coins, reward_hearts) VALUES
  (1, 1, 0, 1, 0, 1),
  (1, 2, 0, 2, 0, 3),
  (1, 3, 1, 4, 0, 14),
  (1, 4, 1, 8, 6, 69),
  (1, 5, 1, 16, 12, 344),
  (1, 6, 1, 32, 24, 1719),
  (1, 7, 1, 64, 48, 8594),
  (1, 8, 1, 128, 96, 0);

-- 농장 2 레벨 설정
INSERT INTO level_configs (farm_id, level, required_stars, required_heart_allowance, reward_coins, reward_hearts) VALUES
  (2, 1, 1, 1, 0, 1),
  (2, 2, 2, 3, 0, 2),
  (2, 3, 3, 9, 0, 9),
  (2, 4, 4, 27, 20, 35),
  (2, 5, 5, 81, 60, 141),
  (2, 6, 6, 243, 180, 563),
  (2, 7, 7, 729, 550, 2253),
  (2, 8, 8, 2187, 1750, 0);

-- 농장 3 레벨 설정
INSERT INTO level_configs (farm_id, level, required_stars, required_heart_allowance, reward_coins, reward_hearts) VALUES
  (3, 1, 2, 1, 0, 1),
  (3, 2, 4, 4, 0, 2),
  (3, 3, 6, 16, 0, 5),
  (3, 4, 8, 64, 50, 15),
  (3, 5, 10, 256, 190, 45),
  (3, 6, 12, 1024, 770, 134),
  (3, 7, 14, 4096, 3070, 401),
  (3, 8, 16, 16384, 13110, 0);

-- 농장 4 레벨 설정
INSERT INTO level_configs (farm_id, level, required_stars, required_heart_allowance, reward_coins, reward_hearts) VALUES
  (4, 1, 3, 1, 0, 1),
  (4, 2, 6, 5, 0, 1),
  (4, 3, 9, 25, 0, 2),
  (4, 4, 12, 125, 90, 4),
  (4, 5, 15, 625, 470, 9),
  (4, 6, 18, 3125, 2340, 18),
  (4, 7, 21, 15625, 11720, 35),
  (4, 8, 24, 78125, 62500, 0);
