// HappyTree 시뮬레이션 엔진 - 핵심 로직

import { CURRENCY, User, LevelConfig, UserFarmProgress, LevelUpResult } from './types';

/**
 * 하트허용치 계산
 * 공식: n번 사용자의 Day d 하트허용치 = (일일 입장 수 × d) - n + 1
 * @param entryOrder 사용자 입장 순서 (1부터 시작)
 * @param currentDay 현재 시뮬레이션 날짜
 * @param dailyNewUsers 일일 신규 입장자 수
 * @returns 현재 하트허용치
 */
export function calculateHeartAllowance(
  entryOrder: number,
  currentDay: number,
  dailyNewUsers: number
): number {
  // 현재까지 총 입장자 수
  const totalUsers = dailyNewUsers * currentDay;
  
  // 이 사용자보다 뒤에 입장한 사람 수 + 1 (자신의 초기값)
  return totalUsers - entryOrder + 1;
}

/**
 * 레벨업 가능 여부 검증
 * @param user 사용자 정보
 * @param levelConfig 레벨 설정 정보
 * @returns 검증 결과
 */
export function canLevelUp(
  user: User,
  levelConfig: LevelConfig
): { canLevelUp: boolean; reason?: string } {
  // 1. 별 체크
  if (user.stars < levelConfig.required_stars) {
    return {
      canLevelUp: false,
      reason: `별이 부족합니다. (필요: ${levelConfig.required_stars}, 보유: ${user.stars})`
    };
  }

  // 2. 하트허용치 체크
  if (user.heart_allowance < levelConfig.required_heart_allowance) {
    return {
      canLevelUp: false,
      reason: `하트허용치가 부족합니다. (필요: ${levelConfig.required_heart_allowance}, 보유: ${user.heart_allowance})`
    };
  }

  // 3. 하트 체크 (항상 충분히 공급되므로 생략 가능하지만 검증)
  if (user.hearts < levelConfig.required_heart_allowance) {
    return {
      canLevelUp: false,
      reason: `하트가 부족합니다. (필요: ${levelConfig.required_heart_allowance}, 보유: ${user.hearts})`
    };
  }

  return { canLevelUp: true };
}

/**
 * 레벨업 실행 (사용자 상태 업데이트)
 * @param user 사용자 정보
 * @param levelConfig 레벨 설정 정보
 * @returns 업데이트된 사용자 정보
 */
export function executeLevelUp(
  user: User,
  levelConfig: LevelConfig
): User {
  return {
    ...user,
    // 별 소모
    stars: user.stars - levelConfig.required_stars,
    
    // 하트허용치 소모
    heart_allowance: user.heart_allowance - levelConfig.required_heart_allowance,
    
    // 코인 획득
    coins: user.coins + levelConfig.reward_coins,
    total_coins_earned: user.total_coins_earned + levelConfig.reward_coins,
    
    // 하트 소모 및 획득
    hearts: user.hearts - levelConfig.required_heart_allowance + levelConfig.reward_hearts,
  };
}

/**
 * 농장 잠금 해제 조건 확인
 * @param farmId 농장 ID
 * @param userProgress 사용자의 모든 농장 진행 상황
 * @returns 잠금 해제 가능 여부
 */
export function canUnlockFarm(
  farmId: number,
  userProgress: UserFarmProgress[]
): boolean {
  // 농장 1은 기본 개방
  if (farmId === 1) return true;

  // 이전 농장 Lv.8 완료 확인
  const previousFarmId = farmId - 1;
  const previousProgress = userProgress.find(p => p.farm_id === previousFarmId);
  
  return previousProgress?.current_level === 8 && previousProgress?.is_completed === 1;
}

/**
 * 사용자 투자 수익률 계산
 * @param user 사용자 정보
 * @returns ROI (%)
 */
export function calculateROI(user: User): number {
  const investment = user.total_stars_purchased * CURRENCY.STAR_PRICE;
  const returns = user.total_coins_earned * CURRENCY.COIN_PRICE;
  
  if (investment === 0) return 0;
  
  return ((returns - investment) / investment) * 100;
}

/**
 * 플랫폼 수익 계산
 * @param totalStarsSold 총 판매된 별
 * @param totalCoinsPaid 총 지급된 코인
 * @returns 플랫폼 수익 ($)
 */
export function calculatePlatformRevenue(
  totalStarsSold: number,
  totalCoinsPaid: number
): number {
  const revenue = totalStarsSold * CURRENCY.STAR_PRICE;
  const payout = totalCoinsPaid * CURRENCY.COIN_PRICE;
  
  return revenue - payout;
}

/**
 * 자동 별 구매 (레벨업에 필요한 만큼만)
 * @param user 사용자 정보
 * @param requiredStars 필요한 별 수
 * @returns 업데이트된 사용자 정보
 */
export function purchaseStars(user: User, requiredStars: number): User {
  const needToBuy = Math.max(0, requiredStars - user.stars);
  
  return {
    ...user,
    stars: user.stars + needToBuy,
    total_stars_purchased: user.total_stars_purchased + needToBuy,
  };
}
