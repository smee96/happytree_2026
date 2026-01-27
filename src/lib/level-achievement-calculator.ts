// 레벨별 달성자 수 및 플랫폼 수익 계산기
// 누적 하트허용치 기반 계산

interface LevelAchievement {
  farm_id: number;
  level: number;
  cumulative_allowance: number; // 누적 필요 하트허용치
  achievers_range: string; // 달성 가능 범위
  achievers_count: number; // 달성자 수
  stars_per_person: number; // 1인당 필요 별
  coins_per_person: number; // 1인당 획득 코인
  total_stars: number; // 총 별 소모
  total_coins: number; // 총 코인 획득
}

interface PlatformRevenue {
  total_stars_sold: number;
  star_revenue_usd: number;
  total_coins_paid: number;
  coin_cost_usd: number;
  net_revenue_usd: number;
  profit_margin_percent: string;
}

// 농장별 레벨 설정 (누적 하트허용치 포함)
const LEVEL_CONFIGS = [
  // 농장 1
  { farm_id: 1, level: 1, cumulative: 1, stars: 0, coins: 0 },
  { farm_id: 1, level: 2, cumulative: 3, stars: 0, coins: 0 },
  { farm_id: 1, level: 3, cumulative: 7, stars: 1, coins: 0 },
  { farm_id: 1, level: 4, cumulative: 15, stars: 1, coins: 6 },
  { farm_id: 1, level: 5, cumulative: 31, stars: 1, coins: 18 },
  { farm_id: 1, level: 6, cumulative: 63, stars: 1, coins: 54 },
  { farm_id: 1, level: 7, cumulative: 127, stars: 1, coins: 162 },
  { farm_id: 1, level: 8, cumulative: 255, stars: 1, coins: 96 },
  
  // 농장 2
  { farm_id: 2, level: 1, cumulative: 256, stars: 1, coins: 0 },
  { farm_id: 2, level: 2, cumulative: 259, stars: 2, coins: 0 },
  { farm_id: 2, level: 3, cumulative: 268, stars: 3, coins: 0 },
  { farm_id: 2, level: 4, cumulative: 295, stars: 4, coins: 20 },
  { farm_id: 2, level: 5, cumulative: 376, stars: 5, coins: 60 },
  { farm_id: 2, level: 6, cumulative: 619, stars: 6, coins: 180 },
  { farm_id: 2, level: 7, cumulative: 1348, stars: 7, coins: 550 },
  { farm_id: 2, level: 8, cumulative: 3535, stars: 8, coins: 1750 },
  
  // 농장 3
  { farm_id: 3, level: 1, cumulative: 1349, stars: 2, coins: 0 },
  { farm_id: 3, level: 2, cumulative: 1353, stars: 4, coins: 0 },
  { farm_id: 3, level: 3, cumulative: 1369, stars: 6, coins: 0 },
  { farm_id: 3, level: 4, cumulative: 1433, stars: 8, coins: 50 },
  { farm_id: 3, level: 5, cumulative: 1689, stars: 10, coins: 190 },
  { farm_id: 3, level: 6, cumulative: 2713, stars: 12, coins: 770 },
  { farm_id: 3, level: 7, cumulative: 6809, stars: 14, coins: 3070 },
  { farm_id: 3, level: 8, cumulative: 23193, stars: 16, coins: 13110 },
  
  // 농장 4
  { farm_id: 4, level: 1, cumulative: 6810, stars: 3, coins: 0 },
  { farm_id: 4, level: 2, cumulative: 6815, stars: 6, coins: 0 },
  { farm_id: 4, level: 3, cumulative: 6840, stars: 9, coins: 0 },
  { farm_id: 4, level: 4, cumulative: 6965, stars: 12, coins: 90 },
  { farm_id: 4, level: 5, cumulative: 7590, stars: 15, coins: 470 },
  { farm_id: 4, level: 6, cumulative: 10715, stars: 18, coins: 2340 },
  { farm_id: 4, level: 7, cumulative: 26340, stars: 21, coins: 11720 },
  { farm_id: 4, level: 8, cumulative: 104465, stars: 24, coins: 62500 },
];

/**
 * 레벨별 달성자 수 계산
 */
export function calculateLevelAchievements(totalUsers: number): LevelAchievement[] {
  const achievements: LevelAchievement[] = [];
  
  for (const config of LEVEL_CONFIGS) {
    // 달성 가능 범위: 1번부터 (totalUsers - cumulative + 1)번까지
    const maxAchiever = totalUsers - config.cumulative + 1;
    const achieversCount = maxAchiever > 0 ? maxAchiever : 0;
    const achieversRange = achieversCount > 0 ? `1~${maxAchiever}` : '없음';
    
    // 총 별/코인 계산
    const totalStars = achieversCount * config.stars;
    const totalCoins = achieversCount * config.coins;
    
    achievements.push({
      farm_id: config.farm_id,
      level: config.level,
      cumulative_allowance: config.cumulative,
      achievers_range: achieversRange,
      achievers_count: achieversCount,
      stars_per_person: config.stars,
      coins_per_person: config.coins,
      total_stars: totalStars,
      total_coins: totalCoins,
    });
  }
  
  return achievements;
}

/**
 * 플랫폼 수익 계산
 */
export function calculatePlatformRevenueFromAchievements(
  achievements: LevelAchievement[]
): PlatformRevenue {
  let totalStars = 0;
  let totalCoins = 0;
  
  for (const achievement of achievements) {
    totalStars += achievement.total_stars;
    totalCoins += achievement.total_coins;
  }
  
  const starRevenue = totalStars * 3; // 별 1개 = $3
  const coinCost = totalCoins * 0.1; // 코인 10개 = $1
  const netRevenue = starRevenue - coinCost;
  const profitMargin = starRevenue > 0 
    ? ((netRevenue / starRevenue) * 100).toFixed(2)
    : '0.00';
  
  return {
    total_stars_sold: totalStars,
    star_revenue_usd: starRevenue,
    total_coins_paid: totalCoins,
    coin_cost_usd: coinCost,
    net_revenue_usd: netRevenue,
    profit_margin_percent: profitMargin,
  };
}

/**
 * 메인 계산 함수
 */
export function calculateFullReport(totalUsers: number) {
  if (totalUsers < 1) {
    throw new Error('총 사용자 수는 1 이상이어야 합니다.');
  }
  
  const achievements = calculateLevelAchievements(totalUsers);
  const platform = calculatePlatformRevenueFromAchievements(achievements);
  
  // 농장별로 그룹화
  const farm1 = achievements.filter(a => a.farm_id === 1);
  const farm2 = achievements.filter(a => a.farm_id === 2);
  const farm3 = achievements.filter(a => a.farm_id === 3);
  const farm4 = achievements.filter(a => a.farm_id === 4);
  
  return {
    total_users: totalUsers,
    farm_1: farm1,
    farm_2: farm2,
    farm_3: farm3,
    farm_4: farm4,
    platform: platform,
  };
}
