// 🔒 초기 레벨 데이터 백업 (읽기 전용)
// 이 파일은 각 농장의 초기 레벨 설정을 보존합니다.
// 수정하지 마세요! 필요시 farm-calculator.ts의 FARM_LEVELS를 수정하세요.

interface FarmLevel {
  level: number;
  hearts_required: number;
  stars: number;
  coins: number;
  hearts_reward: number;
}

// ⭐ 초기 레벨 데이터 (백업용)
export const INITIAL_FARM_LEVELS: { [farmId: number]: FarmLevel[] } = {
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

// 초기 데이터 복구 함수
export function getInitialLevels(farmId: number): FarmLevel[] | undefined {
  return INITIAL_FARM_LEVELS[farmId];
}

// 모든 농장 초기 데이터 복구
export function getAllInitialLevels(): { [farmId: number]: FarmLevel[] } {
  return { ...INITIAL_FARM_LEVELS };
}
