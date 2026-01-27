// 순수 계산 전용 - DB 없이 메모리에서만 계산
// 입력 인원수 N에 따른 핵심 지표 산출

interface FarmLevel {
  level: number;
  required_stars: number;
  required_heart_allowance: number;
  reward_coins: number;
  reward_hearts: number;
}

// 농장 설정 (하드코딩)
const FARM_CONFIGS: { [key: number]: FarmLevel[] } = {
  1: [
    { level: 1, required_stars: 0, required_heart_allowance: 1, reward_coins: 0, reward_hearts: 1 },
    { level: 2, required_stars: 0, required_heart_allowance: 2, reward_coins: 0, reward_hearts: 3 },
    { level: 3, required_stars: 1, required_heart_allowance: 4, reward_coins: 0, reward_hearts: 14 },
    { level: 4, required_stars: 1, required_heart_allowance: 8, reward_coins: 6, reward_hearts: 69 },
    { level: 5, required_stars: 1, required_heart_allowance: 16, reward_coins: 18, reward_hearts: 222 },
    { level: 6, required_stars: 1, required_heart_allowance: 32, reward_coins: 54, reward_hearts: 887 },
    { level: 7, required_stars: 1, required_heart_allowance: 64, reward_coins: 162, reward_hearts: 3549 },
    { level: 8, required_stars: 1, required_heart_allowance: 128, reward_coins: 96, reward_hearts: 0 },
  ],
  2: [
    { level: 1, required_stars: 1, required_heart_allowance: 1, reward_coins: 0, reward_hearts: 1 },
    { level: 2, required_stars: 2, required_heart_allowance: 3, reward_coins: 0, reward_hearts: 2 },
    { level: 3, required_stars: 3, required_heart_allowance: 9, reward_coins: 0, reward_hearts: 9 },
    { level: 4, required_stars: 4, required_heart_allowance: 27, reward_coins: 20, reward_hearts: 35 },
    { level: 5, required_stars: 5, required_heart_allowance: 81, reward_coins: 60, reward_hearts: 141 },
    { level: 6, required_stars: 6, required_heart_allowance: 243, reward_coins: 180, reward_hearts: 563 },
    { level: 7, required_stars: 7, required_heart_allowance: 729, reward_coins: 550, reward_hearts: 2253 },
    { level: 8, required_stars: 8, required_heart_allowance: 2187, reward_coins: 1750, reward_hearts: 0 },
  ],
  3: [
    { level: 1, required_stars: 2, required_heart_allowance: 1, reward_coins: 0, reward_hearts: 1 },
    { level: 2, required_stars: 4, required_heart_allowance: 4, reward_coins: 0, reward_hearts: 2 },
    { level: 3, required_stars: 6, required_heart_allowance: 16, reward_coins: 0, reward_hearts: 5 },
    { level: 4, required_stars: 8, required_heart_allowance: 64, reward_coins: 50, reward_hearts: 15 },
    { level: 5, required_stars: 10, required_heart_allowance: 256, reward_coins: 190, reward_hearts: 45 },
    { level: 6, required_stars: 12, required_heart_allowance: 1024, reward_coins: 770, reward_hearts: 134 },
    { level: 7, required_stars: 14, required_heart_allowance: 4096, reward_coins: 3070, reward_hearts: 401 },
    { level: 8, required_stars: 16, required_heart_allowance: 16384, reward_coins: 13110, reward_hearts: 0 },
  ],
  4: [
    { level: 1, required_stars: 3, required_heart_allowance: 1, reward_coins: 0, reward_hearts: 1 },
    { level: 2, required_stars: 6, required_heart_allowance: 5, reward_coins: 0, reward_hearts: 1 },
    { level: 3, required_stars: 9, required_heart_allowance: 25, reward_coins: 0, reward_hearts: 2 },
    { level: 4, required_stars: 12, required_heart_allowance: 125, reward_coins: 90, reward_hearts: 4 },
    { level: 5, required_stars: 15, required_heart_allowance: 625, reward_coins: 470, reward_hearts: 9 },
    { level: 6, required_stars: 18, required_heart_allowance: 3125, reward_coins: 2340, reward_hearts: 18 },
    { level: 7, required_stars: 21, required_heart_allowance: 15625, reward_coins: 11720, reward_hearts: 35 },
    { level: 8, required_stars: 24, required_heart_allowance: 78125, reward_coins: 62500, reward_hearts: 0 },
  ],
};

interface UserState {
  entry_order: number;
  stars_owned: number;
  stars_used: number;
  coins_owned: number;
  hearts_owned: number;
  heart_allowance_owned: number;
  heart_allowance_used: number;
  highest_farm: number;
  highest_level: number;
  investment_usd: number;
  return_usd: number;
  roi_percent: string;
}

/**
 * N명이 입장했을 때 특정 사용자의 최종 상태 계산
 */
function calculateUserState(entryOrder: number, totalUsers: number): UserState {
  // 초기 상태
  let stars = 0;
  let coins = 0;
  let hearts = 5; // 환영 하트
  let heartAllowance = totalUsers - entryOrder + 1; // 나보다 뒤에 입장한 사람 수 + 1
  let totalStarsPurchased = 0;
  let totalCoinsEarned = 0;
  let heartAllowanceUsed = 0;

  let currentFarm = 1;
  let currentLevel = 0;

  // 농장별로 레벨업 시도
  for (let farmId = 1; farmId <= 4; farmId++) {
    // 농장 잠금 해제 확인
    if (farmId > 1) {
      // 이전 농장 Lv8 완료 필요
      if (currentFarm < farmId || currentLevel < 8) {
        break; // 농장 잠금
      }
      currentFarm = farmId;
      currentLevel = 0;
    }

    const levels = FARM_CONFIGS[farmId];
    if (!levels) break;

    for (const levelConfig of levels) {
      // 별 필요 여부 확인 및 구매
      if (stars < levelConfig.required_stars) {
        const needStars = levelConfig.required_stars - stars;
        stars += needStars;
        totalStarsPurchased += needStars;
      }

      // 하트허용치 확인
      if (heartAllowance < levelConfig.required_heart_allowance) {
        break; // 더 이상 레벨업 불가
      }

      // 레벨업 실행
      stars -= levelConfig.required_stars;
      heartAllowance -= levelConfig.required_heart_allowance;
      heartAllowanceUsed += levelConfig.required_heart_allowance;
      hearts += levelConfig.reward_hearts;
      coins += levelConfig.reward_coins;
      totalCoinsEarned += levelConfig.reward_coins;
      currentLevel = levelConfig.level;
    }

    // 현재 농장이 Lv8 완료되지 않으면 다음 농장 진입 불가
    if (currentLevel < 8) {
      break;
    }
  }

  const investment = totalStarsPurchased * 3;
  const returns = totalCoinsEarned * 0.1;
  const roi = investment > 0 ? ((returns - investment) / investment * 100).toFixed(2) : '0.00';

  return {
    entry_order: entryOrder,
    stars_owned: stars,
    stars_used: totalStarsPurchased,
    coins_owned: coins,
    hearts_owned: hearts,
    heart_allowance_owned: heartAllowance,
    heart_allowance_used: heartAllowanceUsed,
    highest_farm: currentFarm,
    highest_level: currentLevel,
    investment_usd: investment,
    return_usd: returns,
    roi_percent: roi,
  };
}

/**
 * 플랫폼 수익 계산
 */
function calculatePlatformRevenue(userStates: UserState[]) {
  const totalStarsSold = userStates.reduce((sum, u) => sum + u.stars_used, 0);
  const totalCoinsPaid = userStates.reduce((sum, u) => sum + u.coins_owned, 0);
  const starRevenue = totalStarsSold * 3;
  const coinCost = totalCoinsPaid * 0.1;
  const netRevenue = starRevenue - coinCost;
  const profitMargin = starRevenue > 0 ? ((netRevenue / starRevenue) * 100).toFixed(2) : '0.00';

  return {
    total_stars_sold: totalStarsSold,
    total_coins_paid: totalCoinsPaid,
    star_revenue_usd: starRevenue,
    coin_cost_usd: coinCost,
    net_revenue_usd: netRevenue,
    profit_margin_percent: profitMargin,
  };
}

/**
 * 메인 계산 함수: N명 입장 시 핵심 지표 산출
 */
export function calculateKeyMetrics(totalUsers: number) {
  if (totalUsers < 1) {
    throw new Error('총 사용자 수는 1 이상이어야 합니다.');
  }

  const middleIndex = Math.floor(totalUsers / 2);

  // 1번, 중간, 마지막 사용자 계산
  const user1 = calculateUserState(1, totalUsers);
  const userMiddle = calculateUserState(middleIndex + 1, totalUsers);
  const userLast = calculateUserState(totalUsers, totalUsers);

  // 플랫폼 수익 계산 (모든 사용자)
  const allUsers: UserState[] = [];
  for (let i = 1; i <= totalUsers; i++) {
    allUsers.push(calculateUserState(i, totalUsers));
  }
  const platform = calculatePlatformRevenue(allUsers);

  return {
    total_users: totalUsers,
    user_1: user1,
    user_middle: userMiddle,
    user_last: userLast,
    platform,
  };
}
