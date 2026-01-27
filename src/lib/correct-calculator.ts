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
  // cum: 누적 하트허용치 (이 레벨 달성에 필요한 하트허용치)
  // hearts_required: 레벨업 시 소비하는 하트 수 (이전 레벨 대비 증가분)
  // hearts: 레벨업 보상 하트
  { farm: 1, level: 1, cum: 1, hearts_required: 1, stars: 0, coins: 0, hearts: 1 },
  { farm: 1, level: 2, cum: 3, hearts_required: 2, stars: 0, coins: 0, hearts: 3 },
  { farm: 1, level: 3, cum: 7, hearts_required: 4, stars: 1, coins: 0, hearts: 14 },
  { farm: 1, level: 4, cum: 15, hearts_required: 8, stars: 1, coins: 6, hearts: 69 },
  { farm: 1, level: 5, cum: 31, hearts_required: 16, stars: 1, coins: 12, hearts: 344 },
  { farm: 1, level: 6, cum: 63, hearts_required: 32, stars: 1, coins: 24, hearts: 1719 },
  { farm: 1, level: 7, cum: 127, hearts_required: 64, stars: 1, coins: 48, hearts: 8594 },
  { farm: 1, level: 8, cum: 255, hearts_required: 128, stars: 1, coins: 96, hearts: 0 },
  
  // 농장 2 - 이미지에서 확인한 정확한 데이터
  { farm: 2, level: 1, cum: 256, hearts_required: 1, stars: 1, coins: 0, hearts: 1 },
  { farm: 2, level: 2, cum: 259, hearts_required: 3, stars: 2, coins: 0, hearts: 2 },
  { farm: 2, level: 3, cum: 268, hearts_required: 9, stars: 3, coins: 0, hearts: 9 },
  { farm: 2, level: 4, cum: 295, hearts_required: 27, stars: 4, coins: 20, hearts: 35 },
  { farm: 2, level: 5, cum: 376, hearts_required: 81, stars: 5, coins: 60, hearts: 141 },
  { farm: 2, level: 6, cum: 619, hearts_required: 243, stars: 6, coins: 180, hearts: 563 },
  { farm: 2, level: 7, cum: 1348, hearts_required: 729, stars: 7, coins: 550, hearts: 2253 },
  { farm: 2, level: 8, cum: 3535, hearts_required: 2187, stars: 8, coins: 1750, hearts: 0 },
  
  // 농장 3 - 이미지에서 확인한 정확한 데이터
  { farm: 3, level: 1, cum: 3536, hearts_required: 1, stars: 2, coins: 0, hearts: 1 },
  { farm: 3, level: 2, cum: 3540, hearts_required: 4, stars: 4, coins: 0, hearts: 2 },
  { farm: 3, level: 3, cum: 3556, hearts_required: 16, stars: 6, coins: 0, hearts: 5 },
  { farm: 3, level: 4, cum: 3620, hearts_required: 64, stars: 8, coins: 50, hearts: 15 },
  { farm: 3, level: 5, cum: 3876, hearts_required: 256, stars: 10, coins: 190, hearts: 45 },
  { farm: 3, level: 6, cum: 4900, hearts_required: 1024, stars: 12, coins: 770, hearts: 134 },
  { farm: 3, level: 7, cum: 8996, hearts_required: 4096, stars: 14, coins: 3070, hearts: 401 },
  { farm: 3, level: 8, cum: 25380, hearts_required: 16384, stars: 16, coins: 13110, hearts: 0 },
  
  // 농장 4 - 이미지에서 확인한 정확한 데이터
  { farm: 4, level: 1, cum: 25381, hearts_required: 1, stars: 3, coins: 0, hearts: 1 },
  { farm: 4, level: 2, cum: 25386, hearts_required: 5, stars: 6, coins: 0, hearts: 1 },
  { farm: 4, level: 3, cum: 25411, hearts_required: 25, stars: 9, coins: 0, hearts: 2 },
  { farm: 4, level: 4, cum: 25536, hearts_required: 125, stars: 12, coins: 90, hearts: 4 },
  { farm: 4, level: 5, cum: 26161, hearts_required: 625, stars: 15, coins: 470, hearts: 9 },
  { farm: 4, level: 6, cum: 29286, hearts_required: 3125, stars: 18, coins: 2340, hearts: 18 },
  { farm: 4, level: 7, cum: 44911, hearts_required: 15625, stars: 21, coins: 11720, hearts: 35 },
  { farm: 4, level: 8, cum: 123036, hearts_required: 78125, stars: 24, coins: 62500, hearts: 0 },
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
  
  // 1번 사용자 수익 계산
  let user1_stars_purchased = 0;
  let user1_coins_earned = 0;
  let user1_hearts_balance = 0; // 순 보유 하트
  let user1_hearts_spent = 0; // 소비한 하트
  let user1_hearts_earned = 0; // 획득한 하트
  let user1_highest_farm = 1;
  let user1_highest_level = 1;
  
  // 1번 사용자의 하트허용치 = totalUsers (본인 제외한 후속 입장자 수)
  const user1_allowance = totalUsers - 1 + 1; // -1(본인제외) +1(초기값)
  
  // 초기 환영 하트 5개
  const WELCOME_HEARTS = 5;
  user1_hearts_balance = WELCOME_HEARTS;
  user1_hearts_earned = WELCOME_HEARTS;
  
  for (const level of LEVELS) {
    // 조건 1: 하트허용치 충족 확인
    if (user1_allowance < level.cum) {
      // 하트허용치 부족으로 레벨업 불가
      break;
    }
    
    // 조건 2: 보유 하트 ≥ 필요 하트허용치 확인
    if (user1_hearts_balance < level.cum) {
      // 보유 하트가 필요 하트허용치보다 적어서 레벨업 불가
      break;
    }
    
    // 조건 3: 레벨업에 필요한 하트 소비량 확인
    if (user1_hearts_balance < level.hearts_required) {
      // 하트 소비량이 부족하여 레벨업 불가
      break;
    }
    
    // 모든 조건 충족 - 레벨업 가능
    user1_stars_purchased += level.stars;
    user1_coins_earned += level.coins;
    
    // 하트 소비
    user1_hearts_balance -= level.hearts_required;
    user1_hearts_spent += level.hearts_required;
    
    // 하트 보상 획득
    user1_hearts_balance += level.hearts;
    user1_hearts_earned += level.hearts;
    
    user1_highest_farm = level.farm;
    user1_highest_level = level.level;
  }
  
  const user1_investment = user1_stars_purchased * 3;
  const user1_return = user1_coins_earned * 0.1;
  const user1_net_profit = user1_return - user1_investment;
  const user1_roi = user1_investment > 0 
    ? ((user1_net_profit / user1_investment) * 100).toFixed(2)
    : '0.00';
  
  // 256번 사용자 수익 계산
  let user256_stars_purchased = 0;
  let user256_coins_earned = 0;
  let user256_hearts_balance = 0;
  let user256_hearts_spent = 0;
  let user256_hearts_earned = 0;
  let user256_highest_farm = 1;
  let user256_highest_level = 1;
  let user256_exists = false;
  
  if (totalUsers >= 256) {
    user256_exists = true;
    // 256번 사용자의 하트허용치 = totalUsers - 256 + 1
    const user256_allowance = totalUsers - 256 + 1;
    
    // 초기 환영 하트 5개
    user256_hearts_balance = WELCOME_HEARTS;
    user256_hearts_earned = WELCOME_HEARTS;
    
    for (const level of LEVELS) {
      // 조건 1: 하트허용치 충족 확인
      if (user256_allowance < level.cum) {
        // 하트허용치 부족으로 레벨업 불가
        break;
      }
      
      // 조건 2: 보유 하트 ≥ 필요 하트허용치 확인
      if (user256_hearts_balance < level.cum) {
        // 보유 하트가 필요 하트허용치보다 적어서 레벨업 불가
        break;
      }
      
      // 조건 3: 레벨업에 필요한 하트 소비량 확인
      if (user256_hearts_balance < level.hearts_required) {
        // 하트 소비량이 부족하여 레벨업 불가
        break;
      }
      
      // 모든 조건 충족 - 레벨업 가능
      user256_stars_purchased += level.stars;
      user256_coins_earned += level.coins;
      
      // 하트 소비
      user256_hearts_balance -= level.hearts_required;
      user256_hearts_spent += level.hearts_required;
      
      // 하트 보상 획득
      user256_hearts_balance += level.hearts;
      user256_hearts_earned += level.hearts;
      
      user256_highest_farm = level.farm;
      user256_highest_level = level.level;
    }
  }
  
  const user256_investment = user256_stars_purchased * 3;
  const user256_return = user256_coins_earned * 0.1;
  const user256_net_profit = user256_return - user256_investment;
  const user256_roi = user256_investment > 0 
    ? ((user256_net_profit / user256_investment) * 100).toFixed(2)
    : '0.00';
  
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
    user_1: {
      entry_order: 1,
      stars_purchased: user1_stars_purchased,
      coins_earned: user1_coins_earned,
      hearts_balance: user1_hearts_balance, // 현재 보유 하트
      hearts_spent: user1_hearts_spent, // 소비한 하트
      hearts_earned: user1_hearts_earned, // 획득한 하트 (초기 5 + 보상)
      heart_allowance: user1_allowance,
      highest_farm: user1_highest_farm,
      highest_level: user1_highest_level,
      investment_usd: user1_investment,
      return_usd: user1_return,
      net_profit_usd: user1_net_profit,
      roi_percent: user1_roi,
    },
    user_256: user256_exists ? {
      entry_order: 256,
      stars_purchased: user256_stars_purchased,
      coins_earned: user256_coins_earned,
      hearts_balance: user256_hearts_balance,
      hearts_spent: user256_hearts_spent,
      hearts_earned: user256_hearts_earned,
      heart_allowance: totalUsers - 256 + 1,
      highest_farm: user256_highest_farm,
      highest_level: user256_highest_level,
      investment_usd: user256_investment,
      return_usd: user256_return,
      net_profit_usd: user256_net_profit,
      roi_percent: user256_roi,
    } : null,
  };
}
