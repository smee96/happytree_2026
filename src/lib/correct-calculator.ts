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
  // 농장 1 - Lv1~3 하트허용치 0으로 변경, 추가 7을 Lv4~8에 분산
  { farm: 1, level: 1, cum: 0, hearts_required: 0, stars: 0, coins: 0, hearts_reward: 1 },
  { farm: 1, level: 2, cum: 0, hearts_required: 0, stars: 0, coins: 0, hearts_reward: 3 },
  { farm: 1, level: 3, cum: 0, hearts_required: 0, stars: 1, coins: 0, hearts_reward: 14 },
  { farm: 1, level: 4, cum: 15, hearts_required: 15, stars: 1, coins: 6, hearts_reward: 69 },
  { farm: 1, level: 5, cum: 38, hearts_required: 23, stars: 1, coins: 12, hearts_reward: 344 },
  { farm: 1, level: 6, cum: 77, hearts_required: 39, stars: 1, coins: 24, hearts_reward: 1719 },
  { farm: 1, level: 7, cum: 148, hearts_required: 71, stars: 1, coins: 48, hearts_reward: 8594 },
  { farm: 1, level: 8, cum: 283, hearts_required: 135, stars: 1, coins: 96, hearts_reward: 0 },
  
  // 농장 2 - Lv1~3 하트허용치 0으로 변경, 추가 13을 Lv4~8에 분산
  { farm: 2, level: 1, cum: 0, hearts_required: 0, stars: 1, coins: 0, hearts_reward: 1 },
  { farm: 2, level: 2, cum: 0, hearts_required: 0, stars: 2, coins: 0, hearts_reward: 2 },
  { farm: 2, level: 3, cum: 0, hearts_required: 0, stars: 3, coins: 0, hearts_reward: 9 },
  { farm: 2, level: 4, cum: 40, hearts_required: 40, stars: 4, coins: 10, hearts_reward: 35 },
  { farm: 2, level: 5, cum: 134, hearts_required: 94, stars: 5, coins: 30, hearts_reward: 141 },
  { farm: 2, level: 6, cum: 390, hearts_required: 256, stars: 6, coins: 90, hearts_reward: 563 },
  { farm: 2, level: 7, cum: 1132, hearts_required: 742, stars: 7, coins: 275, hearts_reward: 2253 },
  { farm: 2, level: 8, cum: 3332, hearts_required: 2200, stars: 8, coins: 875, hearts_reward: 0 },
  
  // 농장 3 - Lv1~3 하트허용치 0으로 변경, 추가 21을 Lv4~8에 분산
  { farm: 3, level: 1, cum: 0, hearts_required: 0, stars: 2, coins: 0, hearts_reward: 1 },
  { farm: 3, level: 2, cum: 0, hearts_required: 0, stars: 4, coins: 0, hearts_reward: 2 },
  { farm: 3, level: 3, cum: 0, hearts_required: 0, stars: 6, coins: 0, hearts_reward: 5 },
  { farm: 3, level: 4, cum: 85, hearts_required: 85, stars: 8, coins: 25, hearts_reward: 15 },
  { farm: 3, level: 5, cum: 362, hearts_required: 277, stars: 10, coins: 95, hearts_reward: 45 },
  { farm: 3, level: 6, cum: 1407, hearts_required: 1045, stars: 12, coins: 385, hearts_reward: 134 },
  { farm: 3, level: 7, cum: 5524, hearts_required: 4117, stars: 14, coins: 1535, hearts_reward: 401 },
  { farm: 3, level: 8, cum: 21929, hearts_required: 16405, stars: 16, coins: 6555, hearts_reward: 0 },
  
  // 농장 4 - Lv1~3 하트허용치 0으로 변경, 추가 31을 Lv4~8에 분산
  { farm: 4, level: 1, cum: 0, hearts_required: 0, stars: 3, coins: 0, hearts_reward: 1 },
  { farm: 4, level: 2, cum: 0, hearts_required: 0, stars: 6, coins: 0, hearts_reward: 1 },
  { farm: 4, level: 3, cum: 0, hearts_required: 0, stars: 9, coins: 0, hearts_reward: 2 },
  { farm: 4, level: 4, cum: 156, hearts_required: 156, stars: 12, coins: 45, hearts_reward: 4 },
  { farm: 4, level: 5, cum: 812, hearts_required: 656, stars: 15, coins: 235, hearts_reward: 9 },
  { farm: 4, level: 6, cum: 3968, hearts_required: 3156, stars: 18, coins: 1170, hearts_reward: 18 },
  { farm: 4, level: 7, cum: 19624, hearts_required: 15656, stars: 21, coins: 5860, hearts_reward: 35 },
  { farm: 4, level: 8, cum: 97780, hearts_required: 78156, stars: 24, coins: 31250, hearts_reward: 0 },
];

// 사용자 상태 인터페이스
interface UserState {
  entryOrder: number;
  heartsBalance: number;
  heartAllowance: number;
  currentFarmIndex: number; // LEVELS 배열 인덱스
  starsPurchased: number;
  coinsEarned: number;
  heartsEarned: number; // 획득한 총 하트 (환영 하트 포함)
  heartsSpent: number; // 소비한 총 하트
}

export function calculateCorrectReport(totalUsers: number, starPrice: number = 2) {
  // 사용자별 상태 맵
  const users = new Map<number, UserState>();
  
  // 레벨업 시도 함수
  function attemptLevelUp(user: UserState) {
    while (user.currentFarmIndex < LEVELS.length) {
      const nextLevel = LEVELS[user.currentFarmIndex];
      
      // 조건 1: 하트허용치 충족 (hearts_required만 체크)
      if (user.heartAllowance < nextLevel.hearts_required) {
        break;
      }
      
      // 조건 2: 보유 하트 충족
      if (user.heartsBalance < nextLevel.hearts_required) {
        break;
      }
      
      // 레벨업 성공!
      // 별 구매 (별이 필요한 경우 자동 구매)
      if (nextLevel.stars > 0) {
        user.starsPurchased += nextLevel.stars;
      }
      
      // 하트 소비
      user.heartsBalance -= nextLevel.hearts_required;
      user.heartsSpent += nextLevel.hearts_required;
      user.heartAllowance -= nextLevel.hearts_required;
      
      // 하트 보상
      user.heartsBalance += nextLevel.hearts_reward;
      user.heartsEarned += nextLevel.hearts_reward;
      
      // 코인 보상
      user.coinsEarned += nextLevel.coins;
      
      // 다음 레벨로 이동
      user.currentFarmIndex++;
    }
  }
  
  // 순차 입장 시뮬레이션
  for (let entryOrder = 1; entryOrder <= totalUsers; entryOrder++) {
    // 신규 사용자 초기화
    const WELCOME_HEARTS = 5;
    users.set(entryOrder, {
      entryOrder,
      heartsBalance: WELCOME_HEARTS,
      heartAllowance: 0,
      currentFarmIndex: 0,
      starsPurchased: 0,
      coinsEarned: 0,
      heartsEarned: WELCOME_HEARTS,
      heartsSpent: 0,
    });
    
    // 모든 기존 사용자의 허용치 +1
    for (const [userId, user] of users.entries()) {
      if (userId < entryOrder) {
        user.heartAllowance += 1;
      }
    }
    
    // 모든 사용자의 레벨업 시도 (조건 충족 시 자동 레벨업)
    for (const user of users.values()) {
      attemptLevelUp(user);
    }
  }
  
  // 농장별 통계 집계
  const stats: LevelStats[] = [];
  
  for (const level of LEVELS) {
    // 이 레벨을 달성한 사용자 수 계산
    let achieversCount = 0;
    for (const user of users.values()) {
      if (user.currentFarmIndex > LEVELS.indexOf(level)) {
        achieversCount++;
      }
    }
    
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
  
  const starRevenue = totalStars * starPrice;
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
  
  // 사용자 정보 생성 함수
  function getUserInfo(entryOrder: number) {
    const user = users.get(entryOrder);
    if (!user) return null;
    
    const currentLevel = LEVELS[user.currentFarmIndex - 1];
    const investment = user.starsPurchased * starPrice;
    const returnAmount = user.coinsEarned * 0.1;
    const netProfit = returnAmount - investment;
    const roi = investment > 0 
      ? ((netProfit / investment) * 100).toFixed(2)
      : '0.00';
    
    return {
      entry_order: entryOrder,
      stars_purchased: user.starsPurchased,
      coins_earned: user.coinsEarned,
      hearts_balance: user.heartsBalance,
      hearts_spent: user.heartsSpent,
      hearts_earned: user.heartsEarned,
      heart_allowance: user.heartAllowance,
      highest_farm: currentLevel?.farm || 0,
      highest_level: currentLevel?.level || 0,
      investment_usd: investment,
      return_usd: returnAmount,
      net_profit_usd: netProfit,
      roi_percent: roi,
    };
  }
  
  const user1_info = getUserInfo(1);
  const user256_info = getUserInfo(256);
  
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
    user_1: user1_info,
    user_256: user256_info,
  };
}
