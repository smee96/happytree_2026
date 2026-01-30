// 농장별 독립 계산 시스템
// 각 농장은 독립적으로 운영되며, 하트허용치는 같은 농장 내에서만 증가

interface FarmLevel {
  level: number;
  hearts_required: number;
  stars: number;
  coins: number;
  hearts_reward: number;
}

// 농장별 레벨 데이터
const FARM_LEVELS: { [farmId: number]: FarmLevel[] } = {
  1: [
    { level: 1, hearts_required: 0, stars: 0, coins: 0, hearts_reward: 1 },
    { level: 2, hearts_required: 0, stars: 0, coins: 0, hearts_reward: 3 },
    { level: 3, hearts_required: 0, stars: 1, coins: 0, hearts_reward: 14 },
    { level: 4, hearts_required: 15, stars: 1, coins: 6, hearts_reward: 69 },
    { level: 5, hearts_required: 23, stars: 1, coins: 12, hearts_reward: 344 },
    { level: 6, hearts_required: 39, stars: 1, coins: 24, hearts_reward: 1719 },
    { level: 7, hearts_required: 71, stars: 1, coins: 48, hearts_reward: 8594 },
    { level: 8, hearts_required: 135, stars: 1, coins: 96, hearts_reward: 0 },
  ],
  2: [
    { level: 1, hearts_required: 0, stars: 1, coins: 0, hearts_reward: 1 },
    { level: 2, hearts_required: 0, stars: 2, coins: 0, hearts_reward: 2 },
    { level: 3, hearts_required: 0, stars: 3, coins: 0, hearts_reward: 9 },
    { level: 4, hearts_required: 40, stars: 4, coins: 10, hearts_reward: 35 },
    { level: 5, hearts_required: 94, stars: 5, coins: 30, hearts_reward: 141 },
    { level: 6, hearts_required: 256, stars: 6, coins: 90, hearts_reward: 563 },
    { level: 7, hearts_required: 742, stars: 7, coins: 275, hearts_reward: 2253 },
    { level: 8, hearts_required: 2200, stars: 8, coins: 875, hearts_reward: 0 },
  ],
  3: [
    { level: 1, hearts_required: 0, stars: 2, coins: 0, hearts_reward: 1 },
    { level: 2, hearts_required: 0, stars: 4, coins: 0, hearts_reward: 2 },
    { level: 3, hearts_required: 0, stars: 6, coins: 0, hearts_reward: 5 },
    { level: 4, hearts_required: 85, stars: 8, coins: 25, hearts_reward: 15 },
    { level: 5, hearts_required: 277, stars: 10, coins: 95, hearts_reward: 45 },
    { level: 6, hearts_required: 1045, stars: 12, coins: 385, hearts_reward: 134 },
    { level: 7, hearts_required: 4117, stars: 14, coins: 1535, hearts_reward: 401 },
    { level: 8, hearts_required: 16405, stars: 16, coins: 6555, hearts_reward: 0 },
  ],
  4: [
    { level: 1, hearts_required: 0, stars: 3, coins: 0, hearts_reward: 1 },
    { level: 2, hearts_required: 0, stars: 6, coins: 0, hearts_reward: 1 },
    { level: 3, hearts_required: 0, stars: 9, coins: 0, hearts_reward: 2 },
    { level: 4, hearts_required: 156, stars: 12, coins: 45, hearts_reward: 4 },
    { level: 5, hearts_required: 656, stars: 15, coins: 235, hearts_reward: 9 },
    { level: 6, hearts_required: 3156, stars: 18, coins: 1170, hearts_reward: 18 },
    { level: 7, hearts_required: 15656, stars: 21, coins: 5860, hearts_reward: 35 },
    { level: 8, hearts_required: 78156, stars: 24, coins: 31250, hearts_reward: 0 },
  ],
};

interface PotState {
  potNumber: number;
  currentLevel: number; // 0부터 시작 (Lv0 = 미시작)
}

interface UserState {
  entryOrder: number;
  heartsBalance: number;
  heartAllowance: number; // 같은 농장 내 후발 입장자의 화분 개수 합계
  pots: PotState[];
  starsPurchased: number;
  coinsEarned: number;
  heartsEarned: number;
  heartsSpent: number;
}

interface FarmStats {
  farm_id: number;
  level_stats: {
    level: number;
    achievers_count: number;
    stars_per_person: number;
    coins_per_person: number;
    hearts_required: number;
    total_stars_sold: number;
    total_coins_paid: number;
  }[];
  platform: {
    total_stars_sold: number;
    star_revenue_usd: number;
    total_coins_paid: number;
    coin_cost_usd: number;
    net_revenue_usd: number;
    profit_margin_percent: string;
  };
  user_1: {
    entry_order: number;
    pots_count: number;
    stars_purchased: number;
    coins_earned: number;
    hearts_balance: number;
    hearts_spent: number;
    hearts_earned: number;
    heart_allowance: number;
    highest_level: number;
    investment_usd: number;
    return_usd: number;
    net_profit_usd: number;
    roi_percent: string;
    pots: { pot_number: number; level: number }[];
  } | null;
}

/**
 * 단일 농장 계산
 * @param farmId 농장 번호 (1~4)
 * @param totalUsers 총 입장 인원
 * @param maxPots 화분 개수 (1~10)
 * @param starPrice 별 가격 ($1~$5)
 */
export function calculateSingleFarm(
  farmId: number,
  totalUsers: number,
  maxPots: number,
  starPrice: number
): FarmStats {
  const levels = FARM_LEVELS[farmId];
  if (!levels) {
    throw new Error(`Invalid farm ID: ${farmId}`);
  }

  const users = new Map<number, UserState>();

  // 화분 레벨업 시도
  function attemptPotLevelUp(user: UserState, pot: PotState) {
    while (pot.currentLevel < 8) {
      const nextLevel = levels[pot.currentLevel];
      
      // 조건 1: 하트허용치 충족
      if (user.heartAllowance < nextLevel.hearts_required) {
        break;
      }
      
      // 조건 2: 보유 하트 충족
      if (user.heartsBalance < nextLevel.hearts_required) {
        break;
      }
      
      // 레벨업 성공!
      // 별 구매
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
      
      // 레벨 증가
      pot.currentLevel++;
    }
  }

  // 사용자 입장 시뮬레이션
  for (let entryOrder = 1; entryOrder <= totalUsers; entryOrder++) {
    // 신규 사용자 생성
    const newUser: UserState = {
      entryOrder,
      heartsBalance: 5, // 환영 하트
      heartAllowance: 0,
      pots: [],
      starsPurchased: 0,
      coinsEarned: 0,
      heartsEarned: 5, // 환영 하트 포함
      heartsSpent: 0,
    };
    
    users.set(entryOrder, newUser);
    
    // 기존 사용자들의 하트허용치 증가 (후발 입장자가 만드는 화분 개수만큼)
    users.forEach((existingUser, order) => {
      if (order < entryOrder) {
        existingUser.heartAllowance += maxPots; // 화분 개수만큼 증가
      }
    });
    
    // 모든 사용자의 레벨업 시도
    users.forEach(user => {
      // 화분 생성 (최대 maxPots개까지)
      while (user.pots.length < maxPots) {
        user.pots.push({
          potNumber: user.pots.length + 1,
          currentLevel: 0,
        });
      }
      
      // 각 화분 레벨업 시도
      user.pots.forEach(pot => {
        attemptPotLevelUp(user, pot);
      });
    });
  }

  // 통계 집계
  const levelStats = levels.map((level, idx) => {
    // 해당 레벨을 달성한 사용자 수 (화분 단위가 아닌 사용자 단위)
    const achievers = new Set<number>();
    users.forEach(user => {
      const hasPotAtLevel = user.pots.some(pot => pot.currentLevel > idx);
      if (hasPotAtLevel) {
        achievers.add(user.entryOrder);
      }
    });
    
    const achieversCount = achievers.size;
    const totalStars = achieversCount * level.stars;
    const totalCoins = achieversCount * level.coins;
    
    return {
      level: idx + 1,
      achievers_count: achieversCount,
      stars_per_person: level.stars,
      coins_per_person: level.coins,
      hearts_required: level.hearts_required,
      hearts_reward: level.hearts_reward,
      total_stars_sold: totalStars,
      total_coins_paid: totalCoins,
    };
  });

  // 플랫폼 수익
  const totalStars = levelStats.reduce((sum, stat) => sum + stat.total_stars_sold, 0);
  const totalCoins = levelStats.reduce((sum, stat) => sum + stat.total_coins_paid, 0);
  const starRevenue = totalStars * starPrice;
  const coinCost = totalCoins * 0.1;
  const netRevenue = starRevenue - coinCost;
  const profitMargin = starRevenue > 0 ? ((netRevenue / starRevenue) * 100).toFixed(2) : '0.00';

  // 1번 사용자 정보
  const user1 = users.get(1);
  let user1Info = null;
  
  if (user1) {
    const highestLevel = Math.max(0, ...user1.pots.map(p => p.currentLevel));
    const investment = user1.starsPurchased * starPrice;
    const returnAmount = user1.coinsEarned * 0.1;
    const netProfit = returnAmount - investment;
    const roi = investment > 0 ? ((netProfit / investment) * 100).toFixed(2) : '0.00';
    
    user1Info = {
      entry_order: 1,
      pots_count: user1.pots.length,
      stars_purchased: user1.starsPurchased,
      coins_earned: user1.coinsEarned,
      hearts_balance: user1.heartsBalance,
      hearts_spent: user1.heartsSpent,
      hearts_earned: user1.heartsEarned,
      heart_allowance: user1.heartAllowance,
      highest_level: highestLevel,
      investment_usd: investment,
      return_usd: returnAmount,
      net_profit_usd: netProfit,
      roi_percent: roi,
      pots: user1.pots.map(p => ({
        pot_number: p.potNumber,
        level: p.currentLevel,
      })),
    };
  }

  return {
    farm_id: farmId,
    level_stats: levelStats,
    platform: {
      total_stars_sold: totalStars,
      star_revenue_usd: starRevenue,
      total_coins_paid: totalCoins,
      coin_cost_usd: coinCost,
      net_revenue_usd: netRevenue,
      profit_margin_percent: profitMargin,
    },
    user_1: user1Info,
  };
}
