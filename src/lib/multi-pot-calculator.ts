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
  
  // 농장 2 - 코인 보상 50% 감소
  { farm: 2, level: 1, cum: 256, hearts_required: 1, stars: 1, coins: 0, hearts_reward: 1 },
  { farm: 2, level: 2, cum: 259, hearts_required: 3, stars: 2, coins: 0, hearts_reward: 2 },
  { farm: 2, level: 3, cum: 268, hearts_required: 9, stars: 3, coins: 0, hearts_reward: 9 },
  { farm: 2, level: 4, cum: 295, hearts_required: 27, stars: 4, coins: 10, hearts_reward: 35 },
  { farm: 2, level: 5, cum: 376, hearts_required: 81, stars: 5, coins: 30, hearts_reward: 141 },
  { farm: 2, level: 6, cum: 619, hearts_required: 243, stars: 6, coins: 90, hearts_reward: 563 },
  { farm: 2, level: 7, cum: 1348, hearts_required: 729, stars: 7, coins: 275, hearts_reward: 2253 },
  { farm: 2, level: 8, cum: 3535, hearts_required: 2187, stars: 8, coins: 875, hearts_reward: 0 },
  
  // 농장 3 - 코인 보상 50% 감소
  { farm: 3, level: 1, cum: 3536, hearts_required: 1, stars: 2, coins: 0, hearts_reward: 1 },
  { farm: 3, level: 2, cum: 3540, hearts_required: 4, stars: 4, coins: 0, hearts_reward: 2 },
  { farm: 3, level: 3, cum: 3556, hearts_required: 16, stars: 6, coins: 0, hearts_reward: 5 },
  { farm: 3, level: 4, cum: 3620, hearts_required: 64, stars: 8, coins: 25, hearts_reward: 15 },
  { farm: 3, level: 5, cum: 3876, hearts_required: 256, stars: 10, coins: 95, hearts_reward: 45 },
  { farm: 3, level: 6, cum: 4900, hearts_required: 1024, stars: 12, coins: 385, hearts_reward: 134 },
  { farm: 3, level: 7, cum: 8996, hearts_required: 4096, stars: 14, coins: 1535, hearts_reward: 401 },
  { farm: 3, level: 8, cum: 25380, hearts_required: 16384, stars: 16, coins: 6555, hearts_reward: 0 },
  
  // 농장 4 - 코인 보상 50% 감소
  { farm: 4, level: 1, cum: 25381, hearts_required: 1, stars: 3, coins: 0, hearts_reward: 1 },
  { farm: 4, level: 2, cum: 25386, hearts_required: 5, stars: 6, coins: 0, hearts_reward: 1 },
  { farm: 4, level: 3, cum: 25411, hearts_required: 25, stars: 9, coins: 0, hearts_reward: 2 },
  { farm: 4, level: 4, cum: 25536, hearts_required: 125, stars: 12, coins: 45, hearts_reward: 4 },
  { farm: 4, level: 5, cum: 26161, hearts_required: 625, stars: 15, coins: 235, hearts_reward: 9 },
  { farm: 4, level: 6, cum: 29286, hearts_required: 3125, stars: 18, coins: 1170, hearts_reward: 18 },
  { farm: 4, level: 7, cum: 44911, hearts_required: 15625, stars: 21, coins: 5860, hearts_reward: 35 },
  { farm: 4, level: 8, cum: 123036, hearts_required: 78125, stars: 24, coins: 31250, hearts_reward: 0 },
];

// 화분 상태
interface PotState {
  potNumber: number; // 화분 번호
  currentFarmIndex: number; // LEVELS 배열 인덱스
  isCompleted: boolean; // 완료 여부 (농장4 Lv8 달성)
}

// 완료된 화분 정보
interface CompletedPot {
  potNumber: number;
  completedAt: string; // 완료 시점 설명
  finalFarm: number;
  finalLevel: number;
}

// 사용자 상태 (활성 화분 5개 + 창고)
interface UserStateMultiPot {
  entryOrder: number;
  heartsBalance: number;
  heartAllowance: number;
  activePots: PotState[]; // 현재 키우는 중인 화분 (최대 5개)
  warehouse: CompletedPot[]; // 완료된 화분 창고
  starsPurchased: number;
  coinsEarned: number;
  heartsEarned: number;
  heartsSpent: number;
  totalPotsCreated: number; // 생성한 총 화분 수
}

export function calculateMultiPotReport(totalUsers: number, maxPots: number = 5, starPrice: number = 2) {
  const MAX_ACTIVE_POTS = maxPots; // 동시에 키울 수 있는 화분 개수
  const users = new Map<number, UserStateMultiPot>();
  
  // 화분 완료 여부 체크
  function isPotCompleted(pot: PotState): boolean {
    // 농장4 Lv8 (LEVELS 배열의 마지막)에 도달하면 완료
    return pot.currentFarmIndex >= LEVELS.length;
  }
  
  // 화분 레벨업 시도 함수
  function attemptPotLevelUp(user: UserStateMultiPot, pot: PotState) {
    if (pot.isCompleted) return; // 이미 완료된 화분은 건너뜀
    
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
      
      // 완료 체크
      if (isPotCompleted(pot)) {
        pot.isCompleted = true;
        break;
      }
    }
  }
  
  // 완료된 화분을 창고로 이동
  function moveCompletedPotsToWarehouse(user: UserStateMultiPot) {
    const completedPots = user.activePots.filter(p => p.isCompleted);
    
    for (const pot of completedPots) {
      const lastLevel = LEVELS[LEVELS.length - 1];
      user.warehouse.push({
        potNumber: pot.potNumber,
        completedAt: `User ${user.entryOrder} completed pot ${pot.potNumber}`,
        finalFarm: lastLevel.farm,
        finalLevel: lastLevel.level,
      });
    }
    
    // 완료된 화분을 활성 목록에서 제거
    user.activePots = user.activePots.filter(p => !p.isCompleted);
  }
  
  // 모든 화분에 대해 레벨업 시도
  function attemptAllPotsLevelUp(user: UserStateMultiPot) {
    // 화분이 없으면 첫 번째 화분 생성
    if (user.activePots.length === 0) {
      user.totalPotsCreated++;
      user.activePots.push({ 
        potNumber: user.totalPotsCreated, 
        currentFarmIndex: 0,
        isCompleted: false
      });
    }
    
    let madeProgress = true;
    while (madeProgress) {
      madeProgress = false;
      
      // 각 활성 화분에 대해 레벨업 시도
      for (const pot of user.activePots) {
        const beforeIndex = pot.currentFarmIndex;
        attemptPotLevelUp(user, pot);
        if (pot.currentFarmIndex > beforeIndex) {
          madeProgress = true;
        }
      }
      
      // 완료된 화분을 창고로 이동
      moveCompletedPotsToWarehouse(user);
      
      // 새 화분 추가 가능 여부 확인 (활성 화분이 5개 미만일 때)
      if (user.activePots.length < MAX_ACTIVE_POTS) {
        // 마지막 활성 화분이 최소 1레벨 이상 달성했으면 새 화분 추가 가능
        const lastPot = user.activePots[user.activePots.length - 1];
        if (lastPot && lastPot.currentFarmIndex > 0) {
          // 새 화분 생성 시도
          user.totalPotsCreated++;
          const newPot: PotState = {
            potNumber: user.totalPotsCreated,
            currentFarmIndex: 0,
            isCompleted: false
          };
          
          // 새 화분의 첫 레벨업 시도
          const beforeIndex = newPot.currentFarmIndex;
          attemptPotLevelUp(user, newPot);
          
          // 레벨업 성공했으면 화분 추가
          if (newPot.currentFarmIndex > beforeIndex) {
            user.activePots.push(newPot);
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
      activePots: [],
      warehouse: [],
      starsPurchased: 0,
      coinsEarned: 0,
      heartsEarned: WELCOME_HEARTS,
      heartsSpent: 0,
      totalPotsCreated: 0,
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
      // 활성 화분 체크
      for (const pot of user.activePots) {
        if (pot.currentFarmIndex > LEVELS.indexOf(level)) {
          achieversCount++;
        }
      }
      // 완료된 화분도 체크 (모든 레벨 달성)
      for (const completedPot of user.warehouse) {
        achieversCount++;
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
    
    // 최고 달성 레벨 찾기
    let highestFarm = 0;
    let highestLevel = 0;
    for (const pot of user.activePots) {
      if (pot.currentFarmIndex > 0) {
        const level = LEVELS[pot.currentFarmIndex - 1];
        if (level.farm > highestFarm || (level.farm === highestFarm && level.level > highestLevel)) {
          highestFarm = level.farm;
          highestLevel = level.level;
        }
      }
    }
    
    // 완료된 화분도 체크
    for (const completedPot of user.warehouse) {
      if (completedPot.finalFarm > highestFarm || 
          (completedPot.finalFarm === highestFarm && completedPot.finalLevel > highestLevel)) {
        highestFarm = completedPot.finalFarm;
        highestLevel = completedPot.finalLevel;
      }
    }
    
    const investment = user.starsPurchased * starPrice;
    const returnAmount = user.coinsEarned * 0.1;
    const netProfit = returnAmount - investment;
    const roi = investment > 0 
      ? ((netProfit / investment) * 100).toFixed(2)
      : '0.00';
    
    // UI용 pots 배열 생성 (활성 화분 + 완료 화분)
    const pots = [
      ...user.activePots.map(pot => ({
        farm_id: pot.currentFarmIndex > 0 ? LEVELS[pot.currentFarmIndex - 1].farm : 0,
        level: pot.currentFarmIndex > 0 ? LEVELS[pot.currentFarmIndex - 1].level : 0,
        status: 'active' as const,
      })),
      ...user.warehouse.map(pot => ({
        farm_id: pot.finalFarm,
        level: pot.finalLevel,
        status: 'completed' as const,
      })),
    ];
    
    return {
      entry_order: entryOrder,
      active_pots_count: user.activePots.length,
      warehouse_pots_count: user.warehouse.length,
      total_pots_created: user.totalPotsCreated,
      pots, // UI용 화분 배열
      active_pots: user.activePots.map(pot => ({
        pot_number: pot.potNumber,
        farm: pot.currentFarmIndex > 0 ? LEVELS[pot.currentFarmIndex - 1].farm : 0,
        level: pot.currentFarmIndex > 0 ? LEVELS[pot.currentFarmIndex - 1].level : 0,
        is_completed: pot.isCompleted,
      })),
      warehouse_pots: user.warehouse,
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
    max_active_pots: MAX_ACTIVE_POTS,
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
