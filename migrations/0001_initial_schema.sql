-- HappyTree 시뮬레이션 데이터베이스 스키마

-- 농장 설정 테이블
CREATE TABLE IF NOT EXISTS farm_configs (
  farm_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  unlock_condition TEXT -- 'farm_1_lv8', 'farm_2_lv8', etc.
);

-- 레벨 설정 테이블
CREATE TABLE IF NOT EXISTS level_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL,
  level INTEGER NOT NULL,
  required_stars INTEGER NOT NULL,
  required_heart_allowance INTEGER NOT NULL,
  reward_coins INTEGER NOT NULL,
  reward_hearts INTEGER NOT NULL,
  UNIQUE(farm_id, level),
  FOREIGN KEY (farm_id) REFERENCES farm_configs(farm_id)
);

-- 시뮬레이션 세션 테이블
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  daily_new_users INTEGER NOT NULL, -- 일일 신규 입장자 수
  simulation_days INTEGER NOT NULL, -- 시뮬레이션 기간 (일)
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'paused'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  entry_order INTEGER NOT NULL, -- 입장 순서 (1, 2, 3, ...)
  entry_day INTEGER NOT NULL, -- 입장한 날짜 (1일차, 2일차, ...)
  stars INTEGER DEFAULT 0, -- 보유 별
  coins INTEGER DEFAULT 0, -- 보유 코인
  hearts INTEGER DEFAULT 5, -- 보유 하트 (초기 5개)
  heart_allowance INTEGER DEFAULT 1, -- 하트허용치 (초기 1)
  total_stars_purchased INTEGER DEFAULT 0, -- 총 구매한 별 (투자액 계산용)
  total_coins_earned INTEGER DEFAULT 0, -- 총 획득한 코인 (수익 계산용)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, entry_order),
  FOREIGN KEY (session_id) REFERENCES simulation_sessions(id)
);

-- 사용자 농장 진행 상황 테이블
CREATE TABLE IF NOT EXISTS user_farm_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  farm_id INTEGER NOT NULL,
  current_level INTEGER DEFAULT 0, -- 현재 레벨 (0=시작 전, 1-8=레벨)
  is_completed INTEGER DEFAULT 0, -- 농장 완료 여부 (Lv.8 완료)
  is_unlocked INTEGER DEFAULT 0, -- 농장 잠금 해제 여부
  UNIQUE(user_id, farm_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (farm_id) REFERENCES farm_configs(farm_id)
);

-- 레벨업 이력 테이블
CREATE TABLE IF NOT EXISTS levelup_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  farm_id INTEGER NOT NULL,
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  used_stars INTEGER NOT NULL,
  used_heart_allowance INTEGER NOT NULL,
  earned_coins INTEGER NOT NULL,
  earned_hearts INTEGER NOT NULL,
  simulation_day INTEGER NOT NULL, -- 시뮬레이션 상의 날짜
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (farm_id) REFERENCES farm_configs(farm_id)
);

-- 시뮬레이션 통계 테이블
CREATE TABLE IF NOT EXISTS simulation_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  simulation_day INTEGER NOT NULL,
  total_users INTEGER NOT NULL,
  total_stars_sold INTEGER NOT NULL, -- 플랫폼이 판매한 별
  total_coins_paid INTEGER NOT NULL, -- 플랫폼이 지급한 코인
  platform_revenue REAL NOT NULL, -- 플랫폼 수익 ($)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, simulation_day),
  FOREIGN KEY (session_id) REFERENCES simulation_sessions(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_users_entry_order ON users(session_id, entry_order);
CREATE INDEX IF NOT EXISTS idx_farm_progress_user ON user_farm_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_levelup_history_user ON levelup_history(user_id);
CREATE INDEX IF NOT EXISTS idx_levelup_history_day ON levelup_history(simulation_day);
CREATE INDEX IF NOT EXISTS idx_simulation_stats_session ON simulation_stats(session_id);
