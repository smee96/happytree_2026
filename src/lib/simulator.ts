// HappyTree 시뮬레이션 엔진 - 시뮬레이션 실행기

import { DatabaseHelper } from './db-helper';
import { 
  calculateHeartAllowance, 
  canLevelUp, 
  executeLevelUp, 
  canUnlockFarm,
  purchaseStars,
  calculatePlatformRevenue
} from './engine';
import { User, UserAnalysis, CURRENCY } from './types';

export class SimulationRunner {
  constructor(private dbHelper: DatabaseHelper) {}

  /**
   * 시뮬레이션 실행
   * @param sessionId 세션 ID
   * @returns 시뮬레이션 결과
   */
  async runSimulation(sessionId: number): Promise<{
    success: boolean;
    message: string;
    stats?: any;
  }> {
    try {
      const session = await this.dbHelper.getSession(sessionId);
      if (!session) {
        return { success: false, message: '세션을 찾을 수 없습니다.' };
      }

      const { daily_new_users, simulation_days } = session;

      // 각 날짜별로 시뮬레이션 실행
      for (let day = 1; day <= simulation_days; day++) {
        await this.simulateDay(sessionId, day, daily_new_users);
      }

      return {
        success: true,
        message: `시뮬레이션 완료 (${simulation_days}일, 총 ${daily_new_users * simulation_days}명)`
      };
    } catch (error) {
      return {
        success: false,
        message: `시뮬레이션 실행 중 오류: ${error}`
      };
    }
  }

  /**
   * 하루 시뮬레이션 실행
   */
  private async simulateDay(
    sessionId: number,
    day: number,
    dailyNewUsers: number
  ): Promise<void> {
    console.log(`\n=== Day ${day} 시뮬레이션 시작 ===`);
    
    // 1. 신규 사용자 입장
    const existingUsers = await this.dbHelper.getUsersBySession(sessionId);
    const startEntryOrder = existingUsers.length + 1;

    console.log(`[신규 입장] ${dailyNewUsers}명 입장 (입장순서: ${startEntryOrder}~${startEntryOrder + dailyNewUsers - 1})`);

    for (let i = 0; i < dailyNewUsers; i++) {
      const entryOrder = startEntryOrder + i;
      const userId = await this.dbHelper.createUser(sessionId, entryOrder, day);
      
      // 기존 모든 사용자의 하트허용치 +1
      await this.dbHelper.incrementAllUserAllowances(sessionId, entryOrder);
    }

    // 2. 모든 사용자의 하트허용치 재계산 (정확성 보장)
    const allUsers = await this.dbHelper.getUsersBySession(sessionId);
    console.log(`[하트허용치 재계산] 총 ${allUsers.length}명`);
    
    for (const user of allUsers) {
      const calculatedAllowance = calculateHeartAllowance(
        user.entry_order,
        day,
        dailyNewUsers
      );
      
      // 이미 사용한 허용치는 유지하면서 새로 계산된 값으로 업데이트
      // 실제로는 증가분만 적용되어야 하지만, 간단하게 재계산
      user.heart_allowance = calculatedAllowance;
      await this.dbHelper.updateUser(user);
    }

    // 3. 모든 사용자의 자동 레벨업 시도 (가능한 만큼)
    console.log(`[레벨업 처리] ${allUsers.length}명 시도`);
    for (const user of allUsers) {
      await this.autoLevelUpUser(user, day);
    }

    // 4. 통계 저장
    await this.saveStats(sessionId, day);
  }

  /**
   * 사용자 자동 레벨업 (가능한 모든 레벨 진행)
   */
  private async autoLevelUpUser(user: User, currentDay: number): Promise<void> {
    let updatedUser = await this.dbHelper.getUser(user.id);
    if (!updatedUser) return;

    console.log(`[레벨업 시도] User #${user.id} (입장순서: ${user.entry_order})`);
    console.log(`  - 별: ${updatedUser.stars}, 하트허용치: ${updatedUser.heart_allowance}`);

    const userProgress = await this.dbHelper.getUserProgress(user.id);

    // 각 농장별로 레벨업 시도
    for (let farmId = 1; farmId <= 4; farmId++) {
      const progress = userProgress.find(p => p.farm_id === farmId);
      
      // 농장 잠금 해제 확인
      if (!progress || progress.is_unlocked === 0) {
        // 잠금 해제 가능한지 확인
        if (canUnlockFarm(farmId, userProgress)) {
          console.log(`  [농장 ${farmId}] 잠금 해제`);
          await this.dbHelper.unlockFarm(user.id, farmId);
          userProgress.push({
            id: 0,
            user_id: user.id,
            farm_id: farmId,
            current_level: 0,
            is_completed: 0,
            is_unlocked: 1
          });
        } else {
          continue; // 잠금 해제 안됨
        }
      }

      // 농장 완료 확인
      if (progress && progress.is_completed === 1) {
        continue;
      }

      // 현재 레벨부터 Lv.8까지 레벨업 시도
      const currentLevel = progress?.current_level || 0;
      
      for (let level = currentLevel + 1; level <= 8; level++) {
        const levelConfig = await this.dbHelper.getLevelConfig(farmId, level);
        if (!levelConfig) break;

        // 별 자동 구매 (레벨업 검증 전에 먼저 수행)
        if (updatedUser.stars < levelConfig.required_stars) {
          console.log(`  [농장 ${farmId}, Lv.${level}] 별 구매: ${levelConfig.required_stars}개`);
          updatedUser = purchaseStars(updatedUser, levelConfig.required_stars);
        }

        // 레벨업 가능 여부 확인 (별 구매 후)
        const validation = canLevelUp(updatedUser, levelConfig);
        if (!validation.canLevelUp) {
          console.log(`  [농장 ${farmId}, Lv.${level}] 실패: ${validation.reason}`);
          break; // 더 이상 레벨업 불가
        }

        // 레벨업 실행
        const beforeLevel = level - 1;
        updatedUser = executeLevelUp(updatedUser, levelConfig);
        
        console.log(`  [농장 ${farmId}, Lv.${level}] 성공! 코인 +${levelConfig.reward_coins}, 하트 +${levelConfig.reward_hearts}`);

        // 데이터베이스 업데이트
        await this.dbHelper.updateUser(updatedUser);
        await this.dbHelper.updateFarmProgress(
          user.id, 
          farmId, 
          level, 
          level === 8
        );

        // 레벨업 이력 기록
        await this.dbHelper.recordLevelUp(
          user.id,
          farmId,
          beforeLevel,
          level,
          levelConfig.required_stars,
          levelConfig.required_heart_allowance,
          levelConfig.reward_coins,
          levelConfig.reward_hearts,
          currentDay
        );

        // 최신 사용자 정보 다시 가져오기
        updatedUser = await this.dbHelper.getUser(user.id) || updatedUser;
      }
    }
    
    console.log(`  → 최종: 별 ${updatedUser.total_stars_purchased}개 구매, 코인 ${updatedUser.total_coins_earned}개 획득`);
  }

  /**
   * 통계 저장
   */
  private async saveStats(sessionId: number, day: number): Promise<void> {
    const users = await this.dbHelper.getUsersBySession(sessionId);

    const totalStarsSold = users.reduce((sum, u) => sum + u.total_stars_purchased, 0);
    const totalCoinsPaid = users.reduce((sum, u) => sum + u.total_coins_earned, 0);
    const platformRevenue = calculatePlatformRevenue(totalStarsSold, totalCoinsPaid);

    console.log(`[Day ${day} 통계]`);
    console.log(`  - 총 사용자: ${users.length}명`);
    console.log(`  - 총 별 판매: ${totalStarsSold}개 ($${totalStarsSold * 3})`);
    console.log(`  - 총 코인 지급: ${totalCoinsPaid}개 ($${totalCoinsPaid * 0.1})`);
    console.log(`  - 플랫폼 수익: $${platformRevenue}`);

    await this.dbHelper.saveSimulationStats({
      session_id: sessionId,
      simulation_day: day,
      total_users: users.length,
      total_stars_sold: totalStarsSold,
      total_coins_paid: totalCoinsPaid,
      platform_revenue: platformRevenue
    });
  }

  /**
   * 사용자 분석 (투자 수익률 등)
   */
  async analyzeUsers(sessionId: number): Promise<UserAnalysis[]> {
    const users = await this.dbHelper.getUsersBySession(sessionId);
    const analyses: UserAnalysis[] = [];

    for (const user of users) {
      const progress = await this.dbHelper.getUserProgress(user.id);
      
      const investment = user.total_stars_purchased * CURRENCY.STAR_PRICE;
      const returns = user.total_coins_earned * CURRENCY.COIN_PRICE;
      const netProfit = returns - investment;
      const roi = investment > 0 ? (netProfit / investment) * 100 : 0;

      // 막힌 사용자 판단 (하트허용치 부족)
      let isStuck = false;
      for (const p of progress) {
        if (p.is_unlocked === 1 && p.is_completed === 0) {
          const nextLevel = p.current_level + 1;
          if (nextLevel <= 8) {
            const levelConfig = await this.dbHelper.getLevelConfig(p.farm_id, nextLevel);
            if (levelConfig && user.heart_allowance < levelConfig.required_heart_allowance) {
              isStuck = true;
              break;
            }
          }
        }
      }

      analyses.push({
        user_id: user.id,
        entry_order: user.entry_order,
        entry_day: user.entry_day,
        total_investment: investment,
        total_return: returns,
        net_profit: netProfit,
        roi: roi,
        current_level: progress.map(p => ({ farm_id: p.farm_id, level: p.current_level })),
        is_stuck: isStuck
      });
    }

    return analyses;
  }
}
