// HappyTree 시뮬레이션 엔진 - 데이터베이스 헬퍼

import { 
  User, 
  SimulationSession, 
  LevelConfig, 
  UserFarmProgress,
  FarmConfig,
  SimulationStats 
} from './types';

export class DatabaseHelper {
  constructor(private db: D1Database) {}

  // ========== 시뮬레이션 세션 ==========

  async createSession(name: string, dailyNewUsers: number, simulationDays: number): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO simulation_sessions (name, daily_new_users, simulation_days, status)
      VALUES (?, ?, ?, 'running')
    `).bind(name, dailyNewUsers, simulationDays).run();
    
    return result.meta.last_row_id as number;
  }

  async getSession(sessionId: number): Promise<SimulationSession | null> {
    const result = await this.db.prepare(`
      SELECT * FROM simulation_sessions WHERE id = ?
    `).bind(sessionId).first<SimulationSession>();
    
    return result;
  }

  async getAllSessions(): Promise<SimulationSession[]> {
    const result = await this.db.prepare(`
      SELECT * FROM simulation_sessions ORDER BY created_at DESC
    `).all<SimulationSession>();
    
    return result.results;
  }

  // ========== 사용자 관리 ==========

  async createUser(
    sessionId: number, 
    entryOrder: number, 
    entryDay: number
  ): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO users (session_id, entry_order, entry_day, hearts, heart_allowance)
      VALUES (?, ?, ?, 5, 1)
    `).bind(sessionId, entryOrder, entryDay).run();
    
    const userId = result.meta.last_row_id as number;

    // 농장 1 잠금 해제
    await this.db.prepare(`
      INSERT INTO user_farm_progress (user_id, farm_id, current_level, is_unlocked)
      VALUES (?, 1, 0, 1)
    `).bind(userId).run();

    return userId;
  }

  async getUser(userId: number): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first<User>();
    
    return result;
  }

  async getUsersBySession(sessionId: number): Promise<User[]> {
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE session_id = ? ORDER BY entry_order
    `).bind(sessionId).all<User>();
    
    return result.results;
  }

  async updateUser(user: User): Promise<void> {
    await this.db.prepare(`
      UPDATE users 
      SET stars = ?, coins = ?, hearts = ?, heart_allowance = ?,
          total_stars_purchased = ?, total_coins_earned = ?
      WHERE id = ?
    `).bind(
      user.stars, 
      user.coins, 
      user.hearts, 
      user.heart_allowance,
      user.total_stars_purchased,
      user.total_coins_earned,
      user.id
    ).run();
  }

  async incrementAllUserAllowances(sessionId: number, entryOrder: number): Promise<void> {
    // 특정 사용자보다 먼저 입장한 모든 사용자의 하트허용치 +1
    await this.db.prepare(`
      UPDATE users 
      SET heart_allowance = heart_allowance + 1
      WHERE session_id = ? AND entry_order < ?
    `).bind(sessionId, entryOrder).run();
  }

  // ========== 농장 설정 ==========

  async getFarmConfigs(): Promise<FarmConfig[]> {
    const result = await this.db.prepare(`
      SELECT * FROM farm_configs ORDER BY farm_id
    `).all<FarmConfig>();
    
    return result.results;
  }

  async getLevelConfig(farmId: number, level: number): Promise<LevelConfig | null> {
    const result = await this.db.prepare(`
      SELECT * FROM level_configs WHERE farm_id = ? AND level = ?
    `).bind(farmId, level).first<LevelConfig>();
    
    return result;
  }

  async getAllLevelConfigs(farmId: number): Promise<LevelConfig[]> {
    const result = await this.db.prepare(`
      SELECT * FROM level_configs WHERE farm_id = ? ORDER BY level
    `).bind(farmId).all<LevelConfig>();
    
    return result.results;
  }

  // ========== 사용자 농장 진행 상황 ==========

  async getUserProgress(userId: number): Promise<UserFarmProgress[]> {
    const result = await this.db.prepare(`
      SELECT * FROM user_farm_progress WHERE user_id = ? ORDER BY farm_id
    `).bind(userId).all<UserFarmProgress>();
    
    return result.results;
  }

  async getUserFarmProgress(userId: number, farmId: number): Promise<UserFarmProgress | null> {
    const result = await this.db.prepare(`
      SELECT * FROM user_farm_progress WHERE user_id = ? AND farm_id = ?
    `).bind(userId, farmId).first<UserFarmProgress>();
    
    return result;
  }

  async updateFarmProgress(
    userId: number, 
    farmId: number, 
    level: number, 
    isCompleted: boolean
  ): Promise<void> {
    await this.db.prepare(`
      UPDATE user_farm_progress 
      SET current_level = ?, is_completed = ?
      WHERE user_id = ? AND farm_id = ?
    `).bind(level, isCompleted ? 1 : 0, userId, farmId).run();
  }

  async unlockFarm(userId: number, farmId: number): Promise<void> {
    // 먼저 레코드가 있는지 확인
    const existing = await this.getUserFarmProgress(userId, farmId);
    
    if (existing) {
      await this.db.prepare(`
        UPDATE user_farm_progress SET is_unlocked = 1 WHERE user_id = ? AND farm_id = ?
      `).bind(userId, farmId).run();
    } else {
      await this.db.prepare(`
        INSERT INTO user_farm_progress (user_id, farm_id, current_level, is_unlocked)
        VALUES (?, ?, 0, 1)
      `).bind(userId, farmId).run();
    }
  }

  // ========== 레벨업 이력 ==========

  async recordLevelUp(
    userId: number,
    farmId: number,
    fromLevel: number,
    toLevel: number,
    usedStars: number,
    usedHeartAllowance: number,
    earnedCoins: number,
    earnedHearts: number,
    simulationDay: number
  ): Promise<void> {
    await this.db.prepare(`
      INSERT INTO levelup_history 
      (user_id, farm_id, from_level, to_level, used_stars, used_heart_allowance, 
       earned_coins, earned_hearts, simulation_day)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId, farmId, fromLevel, toLevel, usedStars, usedHeartAllowance,
      earnedCoins, earnedHearts, simulationDay
    ).run();
  }

  // ========== 통계 ==========

  async saveSimulationStats(stats: SimulationStats): Promise<void> {
    await this.db.prepare(`
      INSERT OR REPLACE INTO simulation_stats 
      (session_id, simulation_day, total_users, total_stars_sold, total_coins_paid, platform_revenue)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      stats.session_id,
      stats.simulation_day,
      stats.total_users,
      stats.total_stars_sold,
      stats.total_coins_paid,
      stats.platform_revenue
    ).run();
  }

  async getSimulationStats(sessionId: number): Promise<SimulationStats[]> {
    const result = await this.db.prepare(`
      SELECT * FROM simulation_stats WHERE session_id = ? ORDER BY simulation_day
    `).bind(sessionId).all<SimulationStats>();
    
    return result.results;
  }
}
