// 농장별 레벨 초기값 (백업용)
// 이 파일은 수정하지 마세요. 초기값 참조용입니다.

export interface FarmLevel {
  level: number;
  hearts_required: number;
  stars: number;
  coins: number;
  hearts_reward: number;
}

// 설정하기(시뮬레이터)의 초기값 = 현재 farm-calculator.ts의 값
export const INITIAL_FARM_LEVELS: { [farmId: number]: FarmLevel[] } = {
  1: [
    { level: 1, hearts_required: 1, stars: 0, coins: 0, hearts_reward: 1 },
    { level: 2, hearts_required: 2, stars: 0, coins: 0, hearts_reward: 3 },
    { level: 3, hearts_required: 4, stars: 1, coins: 0, hearts_reward: 8 },
    { level: 4, hearts_required: 8, stars: 1, coins: 6, hearts_reward: 16 },
    { level: 5, hearts_required: 16, stars: 1, coins: 12, hearts_reward: 32 },
    { level: 6, hearts_required: 32, stars: 1, coins: 24, hearts_reward: 62 },
    { level: 7, hearts_required: 64, stars: 1, coins: 48, hearts_reward: 100 },
    { level: 8, hearts_required: 128, stars: 1, coins: 96, hearts_reward: 0 },
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

// 특정 농장의 초기값 가져오기
export function getInitialLevels(farmId: number): FarmLevel[] {
  return JSON.parse(JSON.stringify(INITIAL_FARM_LEVELS[farmId] || []));
}

// 모든 농장의 초기값 가져오기
export function getAllInitialLevels(): { [farmId: number]: FarmLevel[] } {
  return JSON.parse(JSON.stringify(INITIAL_FARM_LEVELS));
}
