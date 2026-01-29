// 5개 화분 시스템: 화분 확장 우선 → 레벨업 순차 진행

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
  { farm: 1, level: 1, hearts_required: 1, stars: 0, coins: 0, hearts_reward: 1 },
  { farm: 1, level: 2, hearts_required: 2, stars: 0, coins: 0, hearts_reward: 3 },
  { farm: 1, level: 3, hearts_required: 4, stars: 1, coins: 0, hearts_reward: 14 },
  { farm: 1, level: 4, hearts_required: 8, stars: 1, coins: 6, hearts_reward: 69 },
  { farm: 1, level: 5, hearts_required: 16, stars: 1, coins: 12, hearts_reward: 344 },
  { farm: 1, level: 6, hearts_required: 32, stars: 1, coins: 24, hearts_reward: 1719 },
  { farm: 1, level: 7, hearts_required: 64, stars: 1, coins: 48, hearts_reward: 8594 },
  { farm: 1, level: 8, hearts_required: 128, stars: 1, coins: 96, hearts_reward: 0 },
  
  // 농장 2
  { farm: 2, level: 1, hearts_required: 1, stars: 1, coins: 0, hearts_reward: 1 },
  { farm: 2, level: 2, hearts_required: 3, stars: 2, coins: 0, hearts_reward: 2 },
  { farm: 2, level: 3, hearts_required: 9, stars: 3, coins: 0, hearts_reward: 9 },
  { farm: 2, level: 4, hearts_required: 27, stars: 4, coins: 20, hearts_reward: 35 },
  { farm: 2, level: 5, hearts_required: 81, stars: 5, coins: 60, hearts_reward: 141 },
  { farm: 2, level: 6, hearts_required: 243, stars: 6, coins: 180, hearts_reward: 563 },
  { farm: 2, level: 7, hearts_required: 729, stars: 7, coins: 550, hearts_reward: 2253 },
  { farm: 2, level: 8, hearts_required: 2187, stars: 8, coins: 1750, hearts_reward: 0 },
  
  // 농장 3
  { farm: 3, level: 1, hearts_required: 1, stars: 2, coins: 0, hearts_reward: 1 },
  { farm: 3, level: 2, hearts_required: 4, stars: 4, coins: 0, hearts_reward: 2 },
  { farm: 3, level: 3, hearts_required: 16, stars: 6, coins: 0, hearts_reward: 5 },
  { farm: 3, level: 4, hearts_required: 64, stars: 8, coins: 50, hearts_reward: 15 },
  { farm: 3, level: 5, hearts_required: 256, stars: 10, coins: 190, hearts_reward: 45 },
  { farm: 3, level: 6, hearts_required: 1024, stars: 12, coins: 770, hearts_reward: 134 },
  { farm: 3, level: 7, hearts_required: 4096, stars: 14, coins: 3070, hearts_reward: 401 },
  { farm: 3, level: 8, hearts_required: 16384, stars: 16, coins: 13110, hearts_reward: 0 },
  
  // 농장 4
  { farm: 4, level: 1, hearts_required: 1, stars: 3, coins: 0, hearts_reward: 1 },
  { farm: 4, level: 2, hearts_required: 5, stars: 6, coins: 0, hearts_reward: 1 },
  { farm: 4, level: 3, hearts_required: 25, stars: 9, coins: 0, hearts_reward: 2 },
  { farm: 4, level: 4, hearts_required: 125, stars: 12, coins: 90, hearts_reward: 4 },
  { farm: 4, level: 5, hearts_required: 625, stars: 15, coins: 470, hearts_reward: 9 },
  { farm: 4, level: 6, hearts_required: 3125, stars: 18, coins: 2340, hearts_reward: 18 },
  { farm: 4, level: 7, hearts_required: 15625, stars: 21, coins: 11720, hearts_reward: 35 },
  { farm: 4, level: 8, hearts_required: 78125, stars: 24, coins: 62500, hearts_reward: 0 },
];

// 화분 상태
interface PotState {
  potNumber: number;
  levelIndex: number; // LEVELS 배열의 인덱스 (0부터 시작, 농장1 Lv.1 = 0)
}

// 사용자 상태
interface UserStateFivePots {
  entryOrder: number;
  heartsBalance: number;
  heartAllowance: number;
  currentFarm: number; // 1, 2, 3, 4
  pots: PotState[]; // 최대 5개
  starsPurchased: number;
  coinsEarned: number;
  heartsEarned: number;
  heartsSpent: number;
}

export function calculateFivePotsReport(totalUsers: number, starPrice: number = 2) {
  const users = new Map<number, UserStateFivePots>();
  const MAX_POTS = 5;
  
  // 현재 농장의 시작 레벨 인덱스 찾기
  function getFarmStartIndex(farm: number): number {
    return LEVELS.findIndex(l => l.farm === farm);
  }
  
  // 현재 농장의 끝 레벨 인덱스 찾기 (Lv.8)
  function getFarmEndIndex(farm: number): number {
    const startIndex = getFarmStartIndex(farm);
    return startIndex + 7; // Lv.1~8 = 8개 레벨
  }
  
  // 화분 레벨업 시도
  function attemptPotLevelUp(user: UserStateFivePots, pot: PotState): boolean {
    const farmEndIndex = getFarmEndIndex(user.currentFarm);
    
    // 이미 현재 농장 최고 레벨이면 레벨업 불가
    if (pot.levelIndex >= farmEndIndex) {
      return false;
    }
    
    const nextLevel = LEVELS[pot.levelIndex + 1];
    
    // 조건 체크
    if (user.heartAllowance < nextLevel.hearts_required) return false;
    if (user.heartsBalance < nextLevel.hearts_required) return false;
    
    // 레벨업 실행
    if (nextLevel.stars > 0) {
      user.starsPurchased += nextLevel.stars;
    }
    
    user.heartsBalance -= nextLevel.hearts_required;
    user.heartsSpent += nextLevel.hearts_required;
    user.heartAllowance -= nextLevel.hearts_required;
    
    user.heartsBalance += nextLevel.hearts_reward;
    user.heartsEarned += nextLevel.hearts_reward;
    
    user.coinsEarned += nextLevel.coins;
    
    pot.levelIndex++;
    
    return true;
  }
  
  // 화분 생성 (현재 농장의 Lv.1)
  function createPot(user: UserStateFivePots): boolean {
    if (user.pots.length >= MAX_POTS) return false;
    
    const farmStartIndex = getFarmStartIndex(user.currentFarm);
    const firstLevel = LEVELS[farmStartIndex];
    
    // 조건 체크
    if (user.heartAllowance < firstLevel.hearts_required) return false;
    if (user.heartsBalance < firstLevel.hearts_required) return false;
    
    // 화분 생성 및 Lv.1 달성
    const newPot: PotState = {
      potNumber: user.pots.length + 1,
      levelIndex: farmStartIndex,
    };
    
    if (firstLevel.stars > 0) {
      user.starsPurchased += firstLevel.stars;
    }
    
    user.heartsBalance -= firstLevel.hearts_required;
    user.heartsSpent += firstLevel.hearts_required;
    user.heartAllowance -= firstLevel.hearts_required;
    
    user.heartsBalance += firstLevel.hearts_reward;
    user.heartsEarned += firstLevel.hearts_reward;
    
    user.coinsEarned += firstLevel.coins;
    
    user.pots.push(newPot);
    
    return true;
  }
  
  // 모든 화분이 Lv.8 달성했는지 확인
  function allPotsCompleted(user: UserStateFivePots): boolean {
    if (user.pots.length < MAX_POTS) return false;
    
    const farmEndIndex = getFarmEndIndex(user.currentFarm);
    return user.pots.every(pot => pot.levelIndex === farmEndIndex);
  }
  
  // 다음 농장으로 전환
  function moveToNextFarm(user: UserStateFivePots): boolean {
    if (user.currentFarm >= 4) return false; // 농장 4가 마지막
    if (!allPotsCompleted(user)) return false;
    
    user.currentFarm++;
    user.pots = []; // 화분 초기화
    
    return true;
  }
  
  // 사용자의 자동 진행 처리
  function processUser(user: UserStateFivePots) {
    let madeProgress = true;
    
    while (madeProgress) {
      madeProgress = false;
      
      // 1단계: 화분 확장 (5개까지)
      while (user.pots.length < MAX_POTS) {
        if (createPot(user)) {
          madeProgress = true;
        } else {
          break;
        }
      }
      
      // 2단계: 화분 번호 순서대로 레벨업
      for (const pot of user.pots) {
        if (attemptPotLevelUp(user, pot)) {
          madeProgress = true;
        }
      }
      
      // 3단계: 모든 화분 Lv.8 달성 시 다음 농장으로
      if (allPotsCompleted(user)) {
        if (moveToNextFarm(user)) {
          madeProgress = true;
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
      currentFarm: 1,
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
    
    // 모든 사용자 진행 처리
    for (const user of users.values()) {
      processUser(user);
    }
  }
  
  // 통계 집계: 화분 단위 (화분마다 별/코인 구매)
  const stats: LevelStats[] = [];
  
  for (const level of LEVELS) {
    const levelIndex = LEVELS.indexOf(level);
    let achieversCount = 0;
    
    for (const user of users.values()) {
      // 이 레벨을 달성한 화분 개수 카운트
      for (const pot of user.pots) {
        if (pot.levelIndex >= levelIndex) {
          achieversCount++;
        }
      }
    }
    
    const totalStars = achieversCount * level.stars;
    const totalCoins = achieversCount * level.coins;
    
    stats.push({
      farm_id: level.farm,
      level: level.level,
      cumulative_allowance: 0, // 5개 화분에서는 의미 없음
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
  
  // 사용자 정보 생성
  function getUserInfo(entryOrder: number) {
    const user = users.get(entryOrder);
    if (!user) return null;
    
    // 최고 달성 레벨 찾기
    let highestFarm = user.currentFarm;
    let highestLevel = 0;
    
    for (const pot of user.pots) {
      const level = LEVELS[pot.levelIndex];
      if (level.farm > highestFarm || (level.farm === highestFarm && level.level > highestLevel)) {
        highestFarm = level.farm;
        highestLevel = level.level;
      }
    }
    
    const investment = user.starsPurchased * starPrice;
    const returnAmount = user.coinsEarned * 0.1;
    const netProfit = returnAmount - investment;
    const roi = investment > 0 
      ? ((netProfit / investment) * 100).toFixed(2)
      : '0.00';
    
    return {
      entry_order: entryOrder,
      pots_count: user.pots.length,
      current_farm: user.currentFarm,
      pots: user.pots.map(pot => ({
        pot_number: pot.potNumber,
        farm: LEVELS[pot.levelIndex].farm,
        level: LEVELS[pot.levelIndex].level,
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
  const user256_info = totalUsers >= 256 ? getUserInfo(256) : null;
  
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
