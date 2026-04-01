# HappyTree 시뮬레이션 코드

> **목적**: 다른 에이전트에서 농장 경제 시뮬레이션을 구현할 때 참고  
> **언어**: TypeScript  
> **작성일**: 2026-03-04

---

## 📋 목차

1. [개요](#개요)
2. [핵심 알고리즘](#핵심-알고리즘)
3. [전체 코드](#전체-코드)
4. [사용 예시](#사용-예시)
5. [API 응답 형식](#api-응답-형식)

---

## 개요

### 시뮬레이션 목적
- **대규모 경제 시뮬레이션**: 1명~100만 명 유저의 게임 플레이 예측
- **플랫폼 수익성 검증**: 별 판매 수익 vs 코인 지급 비용
- **유저 ROI 분석**: 투자 대비 수익률 계산

### 핵심 개념

#### 1. 하트 허용치 (Heart Allowance)
```
하트 허용치 = 나의 화분 개수 + 하위 트리 모든 노드의 화분 개수 합계

완전 2진 트리 구조:
       1 (allowance = 7개)
      / \
     2   3 (각각 allowance = 3개, 2개)
    / \ / \
   4  5 6  7
```

**예시**:
- 유저 1: 화분 3개, 하위 노드 (2,3,4,5,6,7) = 3 + (3+3+1+1+1+1) = 13
- 유저 2: 화분 3개, 하위 노드 (4,5) = 3 + (1+1) = 5
- 유저 4: 화분 1개, 하위 노드 없음 = 1

#### 2. 레벨업 조건 (AND)
```javascript
if (
  heartAllowance >= hearts_required &&  // 조건 1
  heartsBalance >= hearts_required      // 조건 2
) {
  // 레벨업 성공
}
```

#### 3. 레벨업 시 처리
```javascript
// 차감
starsPurchased += stars_needed
heartsBalance -= hearts_required

// 획득
heartsBalance += hearts_reward
coinsEarned += coins_reward
level++
```

---

## 핵심 알고리즘

### 1. 완전 2진 트리에서 하위 노드 찾기

```typescript
/**
 * BFS 방식으로 하위 노드 탐색
 * @param nodeIndex 노드 번호 (1부터 시작)
 * @param totalNodes 전체 노드 수
 * @returns 하위 노드 번호 배열
 */
function getDescendants(nodeIndex: number, totalNodes: number): number[] {
  const descendants: number[] = [];
  const queue = [nodeIndex];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const leftChild = 2 * current;      // 왼쪽 자식
    const rightChild = 2 * current + 1; // 오른쪽 자식
    
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
```

**예시**:
```javascript
// 총 7명, 노드 1의 하위 노드
getDescendants(1, 7) // [2, 3, 4, 5, 6, 7]

// 총 7명, 노드 2의 하위 노드
getDescendants(2, 7) // [4, 5]

// 총 7명, 노드 3의 하위 노드
getDescendants(3, 7) // [6, 7]
```

### 2. 하트 허용치 계산

```typescript
// 모든 유저의 하트 허용치 계산
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
```

### 3. 레벨업 시도

```typescript
function attemptPotLevelUp(user: UserState, pot: PotState, levels: FarmLevel[]) {
  while (pot.currentLevel < 8) {
    const nextLevel = levels[pot.currentLevel];
    
    // 조건 1: 하트 허용치 충족
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
    
    // 하트 소비 (허용치도 차감)
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
```

---

## 전체 코드

### farm-calculator.ts

```typescript
// 농장별 독립 계산 시스템
// 각 농장은 독립적으로 운영되며, 하트허용치는 같은 농장 내에서만 증가

interface FarmLevel {
  level: number;
  hearts_required: number;
  stars: number;
  coins: number;
  hearts_reward: number;
}

// 농장별 기본 레벨 데이터
export const FARM_LEVELS: { [farmId: number]: FarmLevel[] } = {
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

interface PotState {
  potNumber: number;
  currentLevel: number; // 0부터 시작 (Lv0 = 미시작)
  createdAt: number; // 화분 생성 순서
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
      heartsBalance: initialHearts,
      heartAllowance: 0,
      pots: [],
      starsPurchased: 0,
      coinsEarned: 0,
      heartsEarned: initialHearts,
      heartsSpent: 0,
    };
    
    users.set(entryOrder, newUser);
    
    // 화분 생성 (한 번에 maxPots개)
    for (let potNum = 1; potNum <= maxPots; potNum++) {
      newUser.pots.push({
        potNumber: potNum,
        currentLevel: 0,
        createdAt: 0,
      });
    }
  }
  
  // 하트허용치 계산 (완전 2진 트리 방식)
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
  
  // 모든 사용자의 레벨업 시도
  users.forEach(user => {
    user.pots.forEach(pot => {
      attemptPotLevelUp(user, pot);
    });
  });

  // 통계 집계
  const levelStats = levels.map((level, idx) => {
    // 해당 레벨을 달성한 사용자 수
    const achievers = new Set<number>();
    // 해당 레벨을 달성한 화분 수
    let potsAtLevel = 0;
    
    // 레벨별 평균 수익 계산용
    let totalInvestment = 0;
    let totalReturn = 0;
    let stoppedAtThisLevel = 0;
    
    users.forEach(user => {
      const potsReachedLevel = user.pots.filter(pot => pot.currentLevel > idx);
      if (potsReachedLevel.length > 0) {
        achievers.add(user.entryOrder);
        potsAtLevel += potsReachedLevel.length;
      }
      
      // 정확히 이 레벨에서 멈춘 사용자
      const highestLevel = Math.max(0, ...user.pots.map(p => p.currentLevel));
      if (highestLevel === idx + 1) {
        stoppedAtThisLevel++;
        totalInvestment += user.starsPurchased * starPrice;
        totalReturn += user.coinsEarned * 0.1; // 코인 → USD
      }
    });
    
    const achieversCount = achievers.size;
    const totalStars = potsAtLevel * level.stars;
    const totalCoins = potsAtLevel * level.coins;
    
    // 1명당 평균 수익
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
```

---

## 사용 예시

### TypeScript/JavaScript

```typescript
import { calculateSingleFarm, FARM_LEVELS } from './farm-calculator';

// 기본 사용
const result = calculateSingleFarm(
  1,        // farmId: 농장 1
  100,      // totalUsers: 100명
  3,        // maxPots: 화분 3개
  2,        // starPrice: $2/별
  300000    // initialHearts: 30만 하트
);

console.log('플랫폼 수익:', result.platform);
console.log('1번 유저:', result.user_1);
console.log('레벨별 통계:', result.level_stats);

// 커스텀 레벨 데이터 사용
const customLevels = [
  { level: 1, hearts_required: 0, stars: 0, coins: 0, hearts_reward: 5 },
  { level: 2, hearts_required: 5, stars: 1, coins: 10, hearts_reward: 10 },
  // ... 레벨 8까지
];

const customResult = calculateSingleFarm(
  1, 100, 3, 2, 300000, customLevels
);
```

### Python 구현 예시

```python
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class FarmLevel:
    level: int
    hearts_required: int
    stars: int
    coins: int
    hearts_reward: int

def get_descendants(node_index: int, total_nodes: int) -> List[int]:
    """완전 2진 트리에서 하위 노드 찾기"""
    descendants = []
    queue = [node_index]
    
    while queue:
        current = queue.pop(0)
        left_child = 2 * current
        right_child = 2 * current + 1
        
        if left_child <= total_nodes:
            descendants.append(left_child)
            queue.append(left_child)
        
        if right_child <= total_nodes:
            descendants.append(right_child)
            queue.append(right_child)
    
    return descendants

def calculate_single_farm(
    farm_id: int,
    total_users: int,
    max_pots: int,
    star_price: float,
    initial_hearts: int = 300000,
    custom_levels: Optional[List[FarmLevel]] = None
) -> Dict:
    # 구현 로직...
    pass
```

---

## API 응답 형식

### 요청
```
GET /api/farm/:farm_id/:total_users/:max_pots?starPrice=2
```

### 응답 예시

```json
{
  "farm_id": 1,
  "level_stats": [
    {
      "level": 1,
      "achievers_count": 100,
      "pots_count": 300,
      "stars_per_person": 0,
      "coins_per_person": 0,
      "hearts_required": 1,
      "hearts_reward": 1,
      "total_stars_sold": 0,
      "total_coins_paid": 0,
      "avg_investment_per_user": "0.00",
      "avg_return_per_user": "0.00",
      "avg_net_profit_per_user": "0.00",
      "avg_roi_per_user": "0.00"
    },
    {
      "level": 2,
      "achievers_count": 95,
      "pots_count": 285,
      "stars_per_person": 0,
      "coins_per_person": 0,
      "hearts_required": 2,
      "hearts_reward": 3,
      "total_stars_sold": 0,
      "total_coins_paid": 0,
      "avg_investment_per_user": "0.00",
      "avg_return_per_user": "0.00",
      "avg_net_profit_per_user": "0.00",
      "avg_roi_per_user": "0.00"
    }
    // ... 레벨 8까지
  ],
  "platform": {
    "total_stars_sold": 450,
    "star_revenue_usd": 900,
    "total_coins_paid": 1200,
    "coin_cost_usd": 120,
    "net_revenue_usd": 780,
    "profit_margin_percent": "86.67"
  },
  "user_1": {
    "entry_order": 1,
    "pots_count": 3,
    "stars_purchased": 6,
    "coins_earned": 186,
    "hearts_balance": 300300,
    "hearts_spent": 255,
    "hearts_earned": 300555,
    "heart_allowance": 42,
    "highest_level": 8,
    "investment_usd": 12,
    "return_usd": 18.6,
    "net_profit_usd": 6.6,
    "roi_percent": "55.00",
    "pots": [
      { "pot_number": 1, "level": 8 },
      { "pot_number": 2, "level": 7 },
      { "pot_number": 3, "level": 6 }
    ]
  }
}
```

---

## 🎯 핵심 포인트

### 1. 성능 최적화
```typescript
// ✅ 좋은 예: Map 사용
const users = new Map<number, UserState>();
users.get(1); // O(1)

// ❌ 나쁜 예: Array 사용
const users = [];
users.find(u => u.id === 1); // O(n)
```

### 2. 메모리 효율
```typescript
// 대규모 시뮬레이션 (100만 명)
// - Map 사용으로 메모리 효율 극대화
// - 불필요한 객체 생성 최소화
```

### 3. 정확한 계산
```typescript
// 하트 허용치는 사용 시 차감!
user.heartAllowance -= nextLevel.hearts_required;

// 이유: 레벨업에 사용한 하트는 다시 사용 불가
```

### 4. 통계 정확도
```typescript
// 레벨별 평균 ROI 계산 시
// "정확히 이 레벨에서 멈춘 사용자"만 포함
const highestLevel = Math.max(0, ...user.pots.map(p => p.currentLevel));
if (highestLevel === idx + 1) {
  // 이 레벨에서 멈춘 사용자
}
```

---

## 📝 체크리스트

다른 언어/프레임워크로 구현 시 확인 사항:

```
✅ 완전 2진 트리 구조 구현 (leftChild = 2*i, rightChild = 2*i+1)
✅ BFS로 하위 노드 탐색
✅ 하트 허용치 = 나 + 하위 모든 노드의 화분 합계
✅ 레벨업 시 허용치도 차감
✅ 레벨별 통계 정확히 집계
✅ 플랫폼 수익 = 별 수익 - 코인 비용
✅ 유저 ROI = (코인 수익 - 별 비용) / 별 비용 × 100
✅ 1번 유저 상세 정보 포함
```

---

**작성자**: Claude (AI Assistant)  
**문서 버전**: 1.0  
**최종 수정**: 2026-03-04  
**프로젝트**: HappyTree v2.0
