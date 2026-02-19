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
  createdAt: number; // 화분 생성 순서 (전체 농장에서의 순서)
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
    pots_count: number;
    stars_per_person: number;
    coins_per_person: number;
    hearts_required: number;
    hearts_reward: number;
    total_stars_sold: number;
    total_coins_paid: number;
    avg_investment_per_user: string;
    avg_return_per_user: string;
    avg_net_profit_per_user: string;
    avg_roi_per_user: string;
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
 * @param starPrice 별 가격
 * @param initialHearts 초기 보유 하트
 * @param customLevels 커스텀 레벨 데이터 (선택사항)
 */
export function calculateSingleFarm(
  farmId: number,
  totalUsers: number,
  maxPots: number,
  starPrice: number,
  initialHearts: number = 300000,
  customLevels?: FarmLevel[]
): FarmStats {
  // 커스텀 레벨이 제공되면 사용, 아니면 기본 레벨 사용
  const levels = customLevels || FARM_LEVELS[farmId];
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
      heartsBalance: initialHearts, // 사용자가 설정한 초기 하트
      heartAllowance: 0,
      pots: [],
      starsPurchased: 0,
      coinsEarned: 0,
      heartsEarned: initialHearts, // 초기 하트 포함
      heartsSpent: 0,
    };
    
    users.set(entryOrder, newUser);
    
    // 화분 생성 (한 번에 maxPots개)
    for (let potNum = 1; potNum <= maxPots; potNum++) {
      newUser.pots.push({
        potNumber: potNum,
        currentLevel: 0,
        createdAt: 0, // 시간은 더 이상 사용하지 않음
      });
    }
  }
  
  // 하트허용치 계산 (모든 농장: 완전 2진 트리 방식)
  // 나 자신 + 하위 트리의 모든 노드들의 화분 개수
  users.forEach((user) => {
    let allowance = user.pots.length; // 나 자신의 화분
    
    // 하위 트리에 속한 모든 노드 찾기
    const descendants = getDescendants(user.entryOrder, totalUsers);
    
    descendants.forEach(descendantOrder => {
      const descendant = users.get(descendantOrder);
      if (descendant) {
        allowance += descendant.pots.length;
      }
    });
    
    user.heartAllowance = allowance;
  });
  
  /**
   * 완전 2진 트리에서 특정 노드의 모든 하위 노드 찾기
   * @param nodeIndex 노드 번호 (1부터 시작)
   * @param totalNodes 전체 노드 수
   * @returns 하위 노드 번호 배열
   */
  function getDescendants(nodeIndex: number, totalNodes: number): number[] {
    const descendants: number[] = [];
    const queue = [nodeIndex];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const leftChild = 2 * current;
      const rightChild = 2 * current + 1;
      
      if (leftChild <= totalNodes) {
        descendants.push(leftChild);
        queue.push(leftChild);
      }
      
      if (rightChild <= totalNodes) {
        descendants.push(rightChild);
        queue.push(rightChild);
      }
    }
    
    return descendants;
  }
  
  // 모든 사용자의 레벨업 시도 (한 번만!)
  users.forEach(user => {
    user.pots.forEach(pot => {
      attemptPotLevelUp(user, pot);
    });
  });

  // 통계 집계
  const levelStats = levels.map((level, idx) => {
    // 해당 레벨을 달성한 사용자 수 (사용자 단위로 집계)
    const achievers = new Set<number>();
    // 해당 레벨을 달성한 화분 수 (실제 별/코인 판매량)
    let potsAtLevel = 0;
    
    // 레벨별 사용자 1명 평균 수익 계산용
    // 정확히 이 레벨에서 멈춘 사람들만 계산
    let totalInvestment = 0;
    let totalReturn = 0;
    let stoppedAtThisLevel = 0; // 이 레벨에서 멈춘 사람 수
    
    users.forEach(user => {
      const potsReachedLevel = user.pots.filter(pot => pot.currentLevel > idx);
      if (potsReachedLevel.length > 0) {
        achievers.add(user.entryOrder);
        potsAtLevel += potsReachedLevel.length;
      }
      
      // 정확히 이 레벨에서 멈춘 사용자 찾기 (최고 레벨이 현재 레벨인 경우)
      const highestLevel = Math.max(0, ...user.pots.map(p => p.currentLevel));
      if (highestLevel === idx + 1) {
        stoppedAtThisLevel++;
        totalInvestment += user.starsPurchased * starPrice;
        totalReturn += user.coinsEarned * 0.1;
      }
    });
    
    const achieversCount = achievers.size;
    // 플랫폼 수익은 화분 단위로 계산 (화분마다 별/코인 구매)
    const totalStars = potsAtLevel * level.stars;
    const totalCoins = potsAtLevel * level.coins;
    
    // 1명당 평균 수익 (이 레벨에서 멈춘 사람들만)
    const avgInvestmentPerUser = stoppedAtThisLevel > 0 ? totalInvestment / stoppedAtThisLevel : 0;
    const avgReturnPerUser = stoppedAtThisLevel > 0 ? totalReturn / stoppedAtThisLevel : 0;
    const avgNetProfitPerUser = avgReturnPerUser - avgInvestmentPerUser;
    const avgRoiPerUser = avgInvestmentPerUser > 0 ? ((avgNetProfitPerUser / avgInvestmentPerUser) * 100).toFixed(2) : '0.00';
    
    return {
      level: idx + 1,
      achievers_count: achieversCount,
      pots_count: potsAtLevel,
      stars_per_person: level.stars,
      coins_per_person: level.coins,
      hearts_required: level.hearts_required,
      hearts_reward: level.hearts_reward,
      total_stars_sold: totalStars,
      total_coins_paid: totalCoins,
      // 1명당 평균 수익 정보 추가
      avg_investment_per_user: avgInvestmentPerUser.toFixed(2),
      avg_return_per_user: avgReturnPerUser.toFixed(2),
      avg_net_profit_per_user: avgNetProfitPerUser.toFixed(2),
      avg_roi_per_user: avgRoiPerUser,
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
