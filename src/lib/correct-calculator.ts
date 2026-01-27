// 올바른 계산: 각 레벨 달성 시 별과 코인 지급
// 레벨별 달성자 수 = 해당 레벨 달성 가능자 수

interface LevelStats {
  farm_id: number;
  level: number;
  cumulative_allowance: number;
  achievers_count: number;
  stars_per_person: number;
  coins_per_person: number;
  total_stars_sold: number;
  total_coins_paid: number;
}

const LEVELS = [
  // 농장 1 - 이미지에서 확인한 정확한 데이터
  { farm: 1, level: 1, cum: 1, stars: 0, coins: 0, hearts: 1 },
  { farm: 1, level: 2, cum: 3, stars: 0, coins: 0, hearts: 3 },
  { farm: 1, level: 3, cum: 7, stars: 1, coins: 0, hearts: 14 },
  { farm: 1, level: 4, cum: 15, stars: 1, coins: 6, hearts: 69 },
  { farm: 1, level: 5, cum: 31, stars: 1, coins: 12, hearts: 344 },
  { farm: 1, level: 6, cum: 63, stars: 1, coins: 24, hearts: 1719 },
  { farm: 1, level: 7, cum: 127, stars: 1, coins: 48, hearts: 8594 },
  { farm: 1, level: 8, cum: 255, stars: 1, coins: 96, hearts: 0 },
  
  // 농장 2 - 이미지에서 확인한 정확한 데이터
  { farm: 2, level: 1, cum: 256, stars: 1, coins: 0, hearts: 1 },
  { farm: 2, level: 2, cum: 259, stars: 2, coins: 0, hearts: 2 },
  { farm: 2, level: 3, cum: 268, stars: 3, coins: 0, hearts: 9 },
  { farm: 2, level: 4, cum: 295, stars: 4, coins: 20, hearts: 35 },
  { farm: 2, level: 5, cum: 376, stars: 5, coins: 60, hearts: 141 },
  { farm: 2, level: 6, cum: 619, stars: 6, coins: 180, hearts: 563 },
  { farm: 2, level: 7, cum: 1348, stars: 7, coins: 550, hearts: 2253 },
  { farm: 2, level: 8, cum: 3535, stars: 8, coins: 1750, hearts: 0 },
  
  // 농장 3 - 이미지에서 확인한 정확한 데이터
  { farm: 3, level: 1, cum: 3536, stars: 2, coins: 0, hearts: 1 },
  { farm: 3, level: 2, cum: 3540, stars: 4, coins: 0, hearts: 2 },
  { farm: 3, level: 3, cum: 3556, stars: 6, coins: 0, hearts: 5 },
  { farm: 3, level: 4, cum: 3620, stars: 8, coins: 50, hearts: 15 },
  { farm: 3, level: 5, cum: 3876, stars: 10, coins: 190, hearts: 45 },
  { farm: 3, level: 6, cum: 4900, stars: 12, coins: 770, hearts: 134 },
  { farm: 3, level: 7, cum: 8996, stars: 14, coins: 3070, hearts: 401 },
  { farm: 3, level: 8, cum: 25380, stars: 16, coins: 13110, hearts: 0 },
  
  // 농장 4 - 이미지에서 확인한 정확한 데이터
  { farm: 4, level: 1, cum: 25381, stars: 3, coins: 0, hearts: 1 },
  { farm: 4, level: 2, cum: 25386, stars: 6, coins: 0, hearts: 1 },
  { farm: 4, level: 3, cum: 25411, stars: 9, coins: 0, hearts: 2 },
  { farm: 4, level: 4, cum: 25536, stars: 12, coins: 90, hearts: 4 },
  { farm: 4, level: 5, cum: 26161, stars: 15, coins: 470, hearts: 9 },
  { farm: 4, level: 6, cum: 29286, stars: 18, coins: 2340, hearts: 18 },
  { farm: 4, level: 7, cum: 44911, stars: 21, coins: 11720, hearts: 35 },
  { farm: 4, level: 8, cum: 123036, stars: 24, coins: 62500, hearts: 0 },
];

export function calculateCorrectReport(totalUsers: number) {
  const stats: LevelStats[] = [];
  
  for (const level of LEVELS) {
    // 이 레벨을 달성할 수 있는 최대 입장순서
    const maxAchiever = totalUsers - level.cum + 1;
    const achieversCount = maxAchiever > 0 ? maxAchiever : 0;
    
    // 이 레벨을 달성하면 별과 코인 획득
    const totalStars = achieversCount * level.stars;
    const totalCoins = achieversCount * level.coins;
    
    stats.push({
      farm_id: level.farm,
      level: level.level,
      cumulative_allowance: level.cum,
      achievers_count: achieversCount,
      stars_per_person: level.stars,
      coins_per_person: level.coins,
      total_stars_sold: totalStars,
      total_coins_paid: totalCoins,
    });
  }
  
  // 플랫폼 수익 계산
  let totalStars = 0;
  let totalCoins = 0;
  
  for (const stat of stats) {
    totalStars += stat.total_stars_sold;
    totalCoins += stat.total_coins_paid;
  }
  
  const starRevenue = totalStars * 3;
  const coinCost = totalCoins * 0.1;
  const netRevenue = starRevenue - coinCost;
  const profitMargin = starRevenue > 0 
    ? ((netRevenue / starRevenue) * 100).toFixed(2)
    : '0.00';
  
  // 농장별로 그룹화
  const farm1 = stats.filter(s => s.farm_id === 1);
  const farm2 = stats.filter(s => s.farm_id === 2);
  const farm3 = stats.filter(s => s.farm_id === 3);
  const farm4 = stats.filter(s => s.farm_id === 4);
  
  return {
    total_users: totalUsers,
    farm_1: farm1,
    farm_2: farm2,
    farm_3: farm3,
    farm_4: farm4,
    platform: {
      total_stars_sold: totalStars,
      star_revenue_usd: starRevenue,
      total_coins_paid: totalCoins,
      coin_cost_usd: coinCost,
      net_revenue_usd: netRevenue,
      profit_margin_percent: profitMargin,
    },
  };
}
