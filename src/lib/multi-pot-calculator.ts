// 5개 화분 버전: 각 농장마다 최대 5개의 화분을 키울 수 있음
// 화분별로 독립적으로 레벨업 가능

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
  // 농장 1
  { farm: 1, level: 1, cum: 1, hearts_required: 1, stars: 0, coins: 0, hearts_reward: 1 },
  { farm: 1, level: 2, cum: 3, hearts_required: 2, stars: 0, coins: 0, hearts_reward: 3 },
  { farm: 1, level: 3, cum: 7, hearts_required: 4, stars: 1, coins: 0, hearts_reward: 14 },
  { farm: 1, level: 4, cum: 15, hearts_required: 8, stars: 1, coins: 6, hearts_reward: 69 },
  { farm: 1, level: 5, cum: 31, hearts_required: 16, stars: 1, coins: 12, hearts_reward: 344 },
  { farm: 1, level: 6, cum: 63, hearts_required: 32, stars: 1, coins: 24, hearts_reward: 1719 },
  { farm: 1, level: 7, cum: 127, hearts_required: 64, stars: 1, coins: 48, hearts_reward: 8594 },
  { farm: 1, level: 8, cum: 255, hearts_required: 128, stars: 1, coins: 96, hearts_reward: 0 },
  
  // 농장 2
  { farm: 2, level: 1, cum: 256, hearts_required: 1, stars: 1, coins: 0, hearts_reward: 1 },
  { farm: 2, level: 2, cum: 259, hearts_required: 3, stars: 2, coins: 0, hearts_reward: 2 },
  { farm: 2, level: 3, cum: 268, hearts_required: 9, stars: 3, coins: 0, hearts_reward: 9 },
  { farm: 2, level: 4, cum: 295, hearts_required: 27, stars: 4, coins: 20, hearts_reward: 35 },
  { farm: 2, level: 5, cum: 376, hearts_required: 81, stars: 5, coins: 60, hearts_reward: 141 },
  { farm: 2, level: 6, cum: 619, hearts_required: 243, stars: 6, coins: 180, hearts_reward: 563 },
  { farm: 2, level: 7, cum: 1348, hearts_required: 729, stars: 7, coins: 550, hearts_reward: 2253 },
  { farm: 2, level: 8, cum: 3535, hearts_required: 2187, stars: 8, coins: 1750, hearts_reward: 0 },
  
  // 농장 3
  { farm: 3, level: 1, cum: 3536, hearts_required: 1, stars: 2, coins: 0, hearts_reward: 1 },
  { farm: 3, level: 2, cum: 3540, hearts_required: 4, stars: 4, coins: 0, hearts_reward: 2 },
  { farm: 3, level: 3, cum: 3556, hearts_required: 16, stars: 6, coins: 0, hearts_reward: 5 },
  { farm: 3, level: 4, cum: 3620, hearts_required: 64, stars: 8, coins: 50, hearts_reward: 15 },
  { farm: 3, level: 5, cum: 3876, hearts_required: 256, stars: 10, coins: 190, hearts_reward: 45 },
  { farm: 3, level: 6, cum: 4900, hearts_required: 1024, stars: 12, coins: 770, hearts_reward: 134 },
  { farm: 3, level: 7, cum: 8996, hearts_required: 4096, stars: 14, coins: 3070, hearts_reward: 401 },
  { farm: 3, level: 8, cum: 25380, hearts_required: 16384, stars: 16, coins: 13110, hearts_reward: 0 },
  
  // 농장 4
  { farm: 4, level: 1, cum: 25381, hearts_required: 1, stars: 3, coins: 0, hearts_reward: 1 },
  { farm: 4, level: 2, cum: 25386, hearts_required: 5, stars: 6, coins: 0, hearts_reward: 1 },
  { farm: 4, level: 3, cum: 25411, hearts_required: 25, stars: 9, coins: 0, hearts_reward: 2 },
  { farm: 4, level: 4, cum: 25536, hearts_required: 125, stars: 12, coins: 90, hearts_reward: 4 },
  { farm: 4, level: 5, cum: 26161, hearts_required: 625, stars: 15, coins: 470, hearts_reward: 9 },
  { farm: 4, level: 6, cum: 29286, hearts_required: 3125, stars: 18, coins: 2340, hearts_reward: 18 },
  { farm: 4, level: 7, cum: 44911, hearts_required: 15625, stars: 21, coins: 11720, hearts_reward: 35 },
  { farm: 4, level: 8, cum: 123036, hearts_required: 78125, stars: 24, coins: 62500, hearts_reward: 0 },
];

// 화분 상태
interface PotState {
  potNumber: number; // 1-5
  currentFarmIndex: number; // LEVELS 배열 인덱스
}

// 사용자 상태 (5개 화분 포함)
interface UserStateMultiPot {
  entryOrder: number;
  heartsBalance: number;
  heartAllowance: number;
  pots: PotState[]; // 최대 5개 화분
  starsPurchased: number;
  coinsEarned: number;
  heartsEarned: number;
  heartsSpent: number;
}

export function calculateMultiPotReport(totalUsers: number, maxPots: number = 5) {
  const MAX_POTS = maxPots; // 파라미터로 받은 값 사용
  const users = new Map<number, UserStateMultiPot>();
  
  // 화분 레벨업 시도 함수
  function attemptPotLevelUp(user: UserStateMultiPot, pot: PotState) {
    while (pot.currentFarmIndex < LEVELS.length) {
      const nextLevel = LEVELS[pot.currentFarmIndex];
      
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
      
      // 다음 레벨로 이동
      pot.currentFarmIndex++;
    }
  }
  
  // 모든 화분에 대해 레벨업 시도 (화분별로 최대한 레벨업)
  function attemptAllPotsLevelUp(user: UserStateMultiPot) {
    // 화분이 없으면 첫 번째 화분 생성
    if (user.pots.length === 0) {
      user.pots.push({ potNumber: 1, currentFarmIndex: 0 });
    }
    
    let madeProgress = true;
    while (madeProgress) {
      madeProgress = false;
      
      // 각 화분에 대해 레벨업 시도
      for (const pot of user.pots) {
        const beforeIndex = pot.currentFarmIndex;
        attemptPotLevelUp(user, pot);
        if (pot.currentFarmIndex > beforeIndex) {
          madeProgress = true;
        }
      }
      
      // 새 화분 추가 가능 여부 확인 (최대 5개까지)
      if (user.pots.length < MAX_POTS) {
        const lastPot = user.pots[user.pots.length - 1];
        // 마지막 화분이 최소 1레벨 이상 달성했으면 새 화분 추가 가능
        if (lastPot.currentFarmIndex > 0) {
          // 새 화분 생성 시도
          const newPot: PotState = {
            potNumber: user.pots.length + 1,
            currentFarmIndex: 0
          };
          
          // 새 화분의 첫 레벨업 시도
          const beforeIndex = newPot.currentFarmIndex;
          attemptPotLevelUp(user, newPot);
          
          // 레벨업 성공했으면 화분 추가
          if (newPot.currentFarmIndex > beforeIndex) {
            user.pots.push(newPot);
            madeProgress = true;
          }
        }
      }
    }
  }
  
  // 순차 입장 시뮬레이션
  for (let entryOrder = 1; entryOrder <= totalUsers; entryOrder++) {
    const WELCOME_HEARTS = 5;
    users.set(entryOrder, {
      entryOrder,
      heartsBalance: WELCOME_HEARTS,
      heartAllowance: 0,
      pots: [],
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
    
    // 모든 사용자의 모든 화분 레벨업 시도
    for (const user of users.values()) {
      attemptAllPotsLevelUp(user);
    }
  }
  
  // 농장별 통계 집계
  const stats: LevelStats[] = [];
  
  for (const level of LEVELS) {
    let achieversCount = 0;
    for (const user of users.values()) {
      for (const pot of user.pots) {
        if (pot.currentFarmIndex > LEVELS.indexOf(level)) {
          achieversCount++;
        }
      }
    }
    
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
  
  const starRevenue = totalStars * 2;
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
    
    // 최고 달성 레벨 찾기
    let highestFarm = 0;
    let highestLevel = 0;
    for (const pot of user.pots) {
      if (pot.currentFarmIndex > 0) {
        const level = LEVELS[pot.currentFarmIndex - 1];
        if (level.farm > highestFarm || (level.farm === highestFarm && level.level > highestLevel)) {
          highestFarm = level.farm;
          highestLevel = level.level;
        }
      }
    }
    
    const investment = user.starsPurchased * 2;
    const returnAmount = user.coinsEarned * 0.1;
    const netProfit = returnAmount - investment;
    const roi = investment > 0 
      ? ((netProfit / investment) * 100).toFixed(2)
      : '0.00';
    
    return {
      entry_order: entryOrder,
      pots_count: user.pots.length,
      pots_details: user.pots.map(pot => ({
        pot_number: pot.potNumber,
        farm: pot.currentFarmIndex > 0 ? LEVELS[pot.currentFarmIndex - 1].farm : 0,
        level: pot.currentFarmIndex > 0 ? LEVELS[pot.currentFarmIndex - 1].level : 0,
      })),
      stars_purchased: user.starsPurchased,
      coins_earned: user.coinsEarned,
      hearts_balance: user.heartsBalance,
      hearts_spent: user.heartsSpent,
      hearts_earned: user.heartsEarned,
      heart_allowance: user.heartAllowance,
      highest_farm: highestFarm,
      highest_level: highestLevel,
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
    max_pots: MAX_POTS,
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
