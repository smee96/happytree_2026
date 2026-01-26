// HappyTree 시뮬레이션 엔진 - 타입 정의

export interface User {
  id: number;
  session_id: number;
  entry_order: number;
  entry_day: number;
  stars: number;
  coins: number;
  hearts: number;
  heart_allowance: number;
  total_stars_purchased: number;
  total_coins_earned: number;
}

export interface FarmConfig {
  farm_id: number;
  name: string;
  unlock_condition: string | null;
}

export interface LevelConfig {
  id: number;
  farm_id: number;
  level: number;
  required_stars: number;
  required_heart_allowance: number;
  reward_coins: number;
  reward_hearts: number;
}

export interface UserFarmProgress {
  id: number;
  user_id: number;
  farm_id: number;
  current_level: number;
  is_completed: number;
  is_unlocked: number;
}

export interface SimulationSession {
  id: number;
  name: string;
  daily_new_users: number;
  simulation_days: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface LevelUpResult {
  success: boolean;
  message: string;
  user?: User;
  progress?: UserFarmProgress;
  reward?: {
    coins: number;
    hearts: number;
  };
}

export interface SimulationStats {
  session_id: number;
  simulation_day: number;
  total_users: number;
  total_stars_sold: number;
  total_coins_paid: number;
  platform_revenue: number;
}

export interface UserAnalysis {
  user_id: number;
  entry_order: number;
  entry_day: number;
  total_investment: number; // $ (별 구매액)
  total_return: number; // $ (코인 현금화)
  net_profit: number; // $
  roi: number; // %
  current_level: { farm_id: number; level: number }[];
  is_stuck: boolean; // 하트허용치 부족으로 막힘
}

export const CURRENCY = {
  STAR_PRICE: 3.0, // $3 per star
  COIN_PRICE: 0.1, // $0.1 per coin
  WELCOME_HEARTS: 5, // 신규 입장자 환영 하트
  INITIAL_ALLOWANCE: 1, // 초기 하트허용치
} as const;
