# HappyTree 게임 개발 가이드라인

> **작성일**: 2026-03-04  
> **버전**: v2.0  
> **목적**: 다른 프로젝트 개발 시 참고용 정책 및 규칙 문서

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [핵심 게임 규칙](#핵심-게임-규칙)
3. [데이터 구조 설계 원칙](#데이터-구조-설계-원칙)
4. [UI/UX 설계 원칙](#uiux-설계-원칙)
5. [경제 시스템 설계](#경제-시스템-설계)
6. [시뮬레이터 설계 원칙](#시뮬레이터-설계-원칙)
7. [개발 환경 및 기술 스택](#개발-환경-및-기술-스택)
8. [배포 및 운영 정책](#배포-및-운영-정책)

---

## 프로젝트 개요

### 목표
- **4개 농장의 독립적인 화분 육성 게임 + 경제 시뮬레이터**
- 게임 플레이를 통한 경제 모델 검증
- 설정(시뮬레이터)과 게임하기의 완전한 분리 및 연동

### 핵심 가치
1. **투명한 경제 시스템**: 모든 수치가 시뮬레이터에서 검증 가능
2. **독립성과 연동성**: 농장별 독립 운영 + 자원 공유
3. **테스트 가능성**: 테스트 모드로 전체 게임 흐름 검증

---

## 핵심 게임 규칙

### 1. 농장 시스템

#### 농장 잠금/해제
```
- 농장 1: 항상 잠금 해제 (기본)
- 농장 2: 농장 1의 화분 중 하나가 Lv.8 달성 시 해제
- 농장 3: 농장 2의 화분 중 하나가 Lv.8 달성 시 해제
- 농장 4: 농장 3의 화분 중 하나가 Lv.8 달성 시 해제
```

**정책**:
- 창고에 보관된 Lv.8 화분도 다음 농장 해제 조건으로 인정
- 테스트 모드에서는 모든 농장이 즉시 잠금 해제

#### 농장별 독립성
```
독립 자원: 화분 목록 (각 농장마다 별도)
공유 자원: 지갑(캐시), 하트, 하트 허용치, 별, 코인
```

**이유**:
- 하트 허용치는 전체 화분 개수로 결정되므로 공유가 자연스러움
- 농장별로 화분만 독립 관리하면 전략적 플레이 가능

---

### 2. 화폐 시스템 (3종)

| 화폐 | 획득 방법 | 용도 | 환금 가능 여부 |
|------|----------|------|---------------|
| **별 ⭐** | 현금 구매 ($2/별) | 레벨업 재료 | ❌ |
| **코인 🪙** | 레벨업 보상 | 환금 ($1/코인) | ✅ |
| **하트 💚** | 레벨업 보상 (무료) | 레벨업 재료 | ❌ |

**핵심 원칙**:
- 별은 플랫폼 수익원 (구매 전용)
- 코인은 유저 수익 (보상 전용)
- 하트는 게임 내 재화 (무료 순환)

---

### 3. 레벨업 조건

#### 필수 조건 (AND)
```
1. 하트 허용치 충족: heartAllowance >= 필요 하트 허용치
2. 하트 보유량 충족: heartsBalance >= 필요 하트
3. 별 보유량 충족: walletBalance >= (필요 별 * 별 가격)
```

**하트 허용치 계산**:
```javascript
// 전체 화분 개수 = 하트 허용치
heartAllowance = 전체 화분 개수 (모든 농장 합계)

// 예시
농장 1: 화분 5개
농장 2: 화분 3개
농장 3: 화분 1개
농장 4: 화분 1개
→ heartAllowance = 10
```

**레벨업 시 차감/획득**:
```javascript
// 차감
walletBalance -= 필요 별 * STAR_PRICE
heartsBalance -= 필요 하트

// 획득
coinsEarned += 보상 코인
heartsBalance += 보상 하트
pot.level += 1
```

---

### 4. 창고 시스템

**규칙**:
```
- Lv.8 (최대 레벨) 화분만 창고로 보낼 수 있음
- 창고에 보낸 화분은 영구 보관 (게임으로 복귀 불가)
- 창고 화분도 다음 농장 잠금 해제 조건으로 인정
```

**이유**:
- 최대 레벨 화분을 정리하여 새로운 화분 육성 공간 확보
- 플레이어의 성취 기록 보존

---

### 5. 테스트 모드

**활성화 시 변경사항**:
```
✅ 모든 농장 즉시 잠금 해제 (2, 3, 4번 농장)
✅ 레벨업 조건 무시 (별, 하트, 허용치 무관)
✅ 자원 차감 없음 (지갑, 하트 소비 안 함)
✅ 보상은 정상 지급 (코인, 하트)
✅ 별도 테스트 통계 기록
```

**UI 표시**:
```
- 잠금 해제된 농장 버튼: "농장 2 🧪"
- 화분 카드: "🧪 테스트 모드" 배지
```

**용도**:
- 농장 2-4의 레벨 설정 검증
- 전체 게임 흐름 빠른 테스트
- 경제 시뮬레이션 검증

---

## 데이터 구조 설계 원칙

### 1. gameState 구조

```javascript
const gameState = {
  // 현재 선택된 농장
  currentFarm: 1,
  
  // 공유 자원 (모든 농장 공통)
  heartsBalance: 300000,      // 하트 보유량
  heartAllowance: 10,         // 하트 허용치 (전체 화분 개수)
  walletBalance: 0,           // 지갑 (현금)
  starsPurchased: 0,          // 구매한 별 (누적)
  coinsEarned: 0,             // 획득한 코인 (누적)
  
  // 농장별 독립 자원
  farmPots: {
    1: [
      {id: 1, level: 0, farmId: 1},
      {id: 2, level: 3, farmId: 1}
    ],
    2: [{id: 1, level: 0, farmId: 2}],
    3: [{id: 1, level: 0, farmId: 3}],
    4: [{id: 1, level: 0, farmId: 4}]
  },
  
  // 창고 (최대 레벨 화분 보관)
  warehouse: [
    {id: 1, level: 8, farmId: 1}
  ],
  
  // 농장 잠금 상태
  farmUnlocked: {
    1: true,
    2: false,
    3: false,
    4: false
  },
  
  // 레벨 설정 (농장별)
  farmLevels: {
    1: [
      {level: 1, hearts_required: 1, stars: 0, coins: 0, hearts_reward: 1},
      // ... Lv.8까지
    ],
    2: [...],
    3: [...],
    4: [...]
  },
  
  // 테스트 모드
  testMode: false,
  testStats: {
    starsPurchased: 0,
    coinsEarned: 0,
    heartAllowanceUsed: 0
  }
}
```

### 2. 초기값 관리

**백업 파일** (`farm-levels-initial.ts`):
```typescript
export const INITIAL_FARM_LEVELS: Record<number, FarmLevel[]> = {
  1: [
    {level: 1, hearts_required: 1, stars: 0, coins: 0, hearts_reward: 1},
    {level: 2, hearts_required: 2, stars: 0, coins: 0, hearts_reward: 3},
    {level: 3, hearts_required: 4, stars: 1, coins: 0, hearts_reward: 8},
    {level: 4, hearts_required: 8, stars: 1, coins: 6, hearts_reward: 16},
    {level: 5, hearts_required: 16, stars: 1, coins: 12, hearts_reward: 32},
    {level: 6, hearts_required: 32, stars: 1, coins: 24, hearts_reward: 62},
    {level: 7, hearts_required: 64, stars: 1, coins: 48, hearts_reward: 100},
    {level: 8, hearts_required: 128, stars: 1, coins: 96, hearts_reward: 0}
  ],
  // 농장 2-4 생략
}
```

**상수 설정** (`ui-game.ts`):
```typescript
const INITIAL_HEARTS = 300000;  // 초기 하트 보유량
const STAR_PRICE = 2;           // 별 1개 가격 ($)
```

### 3. 데이터 우선순위

#### 시뮬레이터 (설정하기)
```
1. localStorage['farmX_config'] (현재 설정값)
2. farm-levels-initial.ts (초기값)
```

#### 게임 (게임하기)
```
1. localStorage['game_farmX_levels'] (게임 내 수정값)
2. localStorage['farmX_config'] (시뮬레이터 설정값)
3. /api/farm-levels (API 기본값)
```

**정책**:
- 시뮬레이터는 읽기 전용 백업에서 복원 가능
- 게임은 시뮬레이터 설정을 초기값으로 사용
- 게임 내 수정값은 독립 저장소 사용

---

## UI/UX 설계 원칙

### 1. 페이지 구성

```
/ (메인)
  ↓
  ├─ /simulator (설정하기)
  │   └─ 농장별 경제 시뮬레이션
  │
  └─ /game (게임하기)
      └─ 실제 게임 플레이
```

### 2. 상태 표시 원칙

#### 필수 표시 항목
```
✅ 현재 농장 번호
✅ 지갑 잔액 ($)
✅ 하트 보유량
✅ 하트 허용치
✅ 구매한 별 (누적)
✅ 획득한 코인 (누적)
✅ 화분 개수 (현재 농장)
```

#### 농장 전환 시 업데이트
```javascript
function selectFarm(farmId) {
  // ...
  updateStats();  // ⚠️ 필수! 농장 전환 시 상태 업데이트
}
```

### 3. 화분 카드 UI

**레벨별 이모지**:
```javascript
const POT_EMOJIS = {
  0: '🏺',  // 빈 화분
  1: '🟤',  // 흙
  2: '🌱',  // 씨앗
  3: '🌿',  // 작은 싹
  4: '🪴',  // 화분 식물
  5: '🌳',  // 작은 나무
  6: '🌲',  // 큰 나무
  7: '🌴',  // 야자수
  8: '🎄'   // 완성된 나무 (최대 레벨)
}
```

**조건 부족 시 표시**:
```
레벨업 불가능 ⚠️
→ 부족: 하트 허용치 3, 하트 50, 별 2개 ($4.00)
```

**최대 레벨 시 UI**:
```html
<div class="pot-card max-level">
  🎄 화분 #3 - Lv.8
  <span class="badge">최대 레벨</span>
  <button>🏛️ 창고로 보내기</button>
</div>
```

### 4. 모달 디자인

#### 지갑 충전 모달
```
💰 지갑 충전
현재 잔액: $100.00

[$10]  [$50]  [$100]  [$500]

[닫기]
```

#### 레벨업 모달
```
🎉 레벨업 성공!

화분 #2가 Lv.4로 성장했습니다!

보상:
🪙 코인 +6
💚 하트 +16

[확인]
```

#### 레벨 설정 편집 모달 (게임)
```
⚙️ 레벨 설정 편집 - 농장 1

레벨 | 하트 | 별 | 코인 | 보상하트
-----|------|----|----- |---------
 1   |  1   | 0  |  0   |    1
 2   |  2   | 0  |  0   |    3
 ... (편집 가능)

[저장]  [시뮬레이터 값으로 복원]  [취소]
```

---

## 경제 시스템 설계

### 1. 수익 구조

#### 플랫폼 (운영자) 수익
```
수익 = 별 판매 수익 - 코인 지급 비용

별 판매 수익 = 총 별 판매 개수 × 별 가격
코인 지급 비용 = 총 코인 지급 개수 × $1
```

#### 유저 수익
```
수익 = 코인 획득 - 별 구매 비용
ROI = (수익 / 투자) × 100%
```

### 2. 농장별 경제 밸런스

**설계 원칙**:
```
농장 1: 낮은 진입 장벽, 낮은 수익률 (ROI ~10%)
농장 2: 중간 진입 장벽, 중간 수익률 (ROI ~20%)
농장 3: 높은 진입 장벽, 높은 수익률 (ROI ~30%)
농장 4: 최고 진입 장벽, 최고 수익률 (ROI ~40%)
```

**하트 허용치 설정**:
```
Lv.1-3: 하트 허용치 = 0 (무료 진입)
Lv.4-8: 하트 허용치 증가 (나중 유저의 화분 개수 필요)
```

**이유**:
- 초기 진입 장벽 제거
- 네트워크 효과 유도 (나중 유저가 먼저 온 유저의 레벨업 도움)

### 3. 시뮬레이션 검증 항목

```javascript
// 플랫폼 수익성
starRevenue = totalStarsSold × starPrice
coinCost = totalCoinsEarned × 1
netRevenue = starRevenue - coinCost
profitMargin = (netRevenue / starRevenue) × 100

// 검증 기준
profitMargin >= 50%  // 플랫폼 수익률 최소 50% 이상

// 유저 만족도
averageROI >= 10%    // 평균 ROI 10% 이상
achievementRate >= 30%  // 최대 레벨 달성률 30% 이상
```

---

## 시뮬레이터 설계 원칙

### 1. 시뮬레이터 vs 게임

| 항목 | 시뮬레이터 (/simulator) | 게임 (/game) |
|------|-------------------------|--------------|
| **목적** | 경제 검증 | 실제 플레이 |
| **대상** | 대규모 (1-100만 유저) | 개인 (1-10 화분) |
| **레벨 설정** | 편집 가능 + 저장 | 시뮬레이터 값 불러오기 + 독립 편집 |
| **데이터 저장** | `farmX_config` | `game_farmX_levels` |
| **초기화** | 백업 파일 복원 | 시뮬레이터 값으로 복원 |

### 2. 시뮬레이션 로직

```javascript
// 의사 코드
for (각 유저) {
  for (각 화분) {
    for (레벨 1→8) {
      // 1. 하트 허용치 계산
      heartAllowance = 나중에 가입한 유저들의 총 화분 개수
      
      // 2. 레벨업 가능 여부 확인
      if (heartAllowance >= 필요하트허용치 && 
          heartsBalance >= 필요하트) {
        
        // 3. 별 구매 (현금 지출)
        walletBalance -= 필요별 × 별가격
        starsPurchased += 필요별
        
        // 4. 하트 소비
        heartsBalance -= 필요하트
        
        // 5. 보상 획득
        coinsEarned += 보상코인
        heartsBalance += 보상하트
        
        // 6. 레벨업
        level++
      } else {
        break  // 더 이상 레벨업 불가
      }
    }
  }
}

// 통계 집계
플랫폼수익 = 총별판매 × 별가격 - 총코인지급
유저평균ROI = (평균코인획득 - 평균별구매비용) / 평균별구매비용 × 100
```

### 3. 저장 및 복원

**저장** (`farmX_config`):
```javascript
function saveAllSettings() {
  const config = {
    totalUsers: document.getElementById('total-users').value,
    maxPots: document.getElementById('max-pots').value,
    starPrice: document.getElementById('star-price').value,
    initialHearts: document.getElementById('initial-hearts').value,
    levels: getLevelConfig()  // 레벨별 설정
  };
  localStorage.setItem(`farm${currentFarm}_config`, JSON.stringify(config));
}
```

**복원** (백업에서):
```javascript
function resetToInitial() {
  // farm-levels-initial.ts에서 불러오기
  const initialLevels = INITIAL_FARM_LEVELS[currentFarm];
  
  // UI 업데이트
  renderLevelConfig(initialLevels);
  
  // 저장
  saveAllSettings();
}
```

---

## 개발 환경 및 기술 스택

### 1. 프로젝트 구조

```
webapp-v2/
├── src/
│   ├── index.tsx              # Hono 앱 진입점
│   ├── routes/
│   │   └── farm.ts            # API 라우트
│   ├── lib/
│   │   ├── farm-calculator.ts # 시뮬레이션 로직
│   │   └── farm-levels-initial.ts  # 초기값 백업
│   ├── ui-template.ts         # 시뮬레이터 HTML 템플릿
│   └── ui-game.ts             # 게임 HTML 템플릿
├── public/
│   └── static/
│       └── (정적 파일)
├── dist/                      # 빌드 출력
├── wrangler.jsonc            # Cloudflare 설정
├── package.json
├── ecosystem.config.cjs      # PM2 설정 (로컬 개발용)
└── README.md
```

### 2. 기술 스택

```yaml
Backend:
  - Hono (Cloudflare Workers)
  - TypeScript

Frontend:
  - Vanilla JavaScript
  - Tailwind CSS (CDN)
  - Font Awesome (아이콘)

Storage:
  - LocalStorage (클라이언트 저장)
  - No database (서버리스)

Deployment:
  - Cloudflare Pages
  - Wrangler CLI

Development:
  - PM2 (로컬 서버 관리)
  - Vite (빌드 도구)
```

### 3. 핵심 명령어

```bash
# 개발 서버 (로컬)
npm run build
pm2 start ecosystem.config.cjs

# 서버 재시작
fuser -k 3001/tcp 2>/dev/null || true
pm2 restart happytree-v2

# 프로덕션 배포
npm run build
npx wrangler pages deploy dist --project-name happy-tree-game

# Git 커밋
git add .
git commit -m "feat: Add new feature"
git push origin main
```

---

## 배포 및 운영 정책

### 1. 브랜치 전략

```
main (프로덕션)
  → 안정 버전만 머지
  → 배포 자동화

develop (개발)
  → 새 기능 개발
  → 테스트 후 main으로 머지
```

### 2. 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 수정
style: 코드 포맷팅
test: 테스트 추가
chore: 빌드/설정 변경
```

### 3. 배포 체크리스트

```
✅ npm run build 성공
✅ 로컬 테스트 (localhost:3001)
✅ 레벨 설정 검증 (시뮬레이터)
✅ 농장 전환 테스트
✅ 테스트 모드 검증
✅ Git 커밋 및 푸시
✅ Wrangler 배포
✅ 프로덕션 URL 확인
```

### 4. 롤백 정책

```bash
# 이전 버전으로 롤백
git revert HEAD
npm run build
npx wrangler pages deploy dist --project-name happy-tree-game

# 또는 특정 커밋으로
git reset --hard <commit-hash>
npm run build
npx wrangler pages deploy dist --project-name happy-tree-game
```

### 5. 모니터링

**확인 항목**:
```
✅ 페이지 로드 시간 (< 2초)
✅ API 응답 시간 (< 500ms)
✅ 오류 로그 확인 (Cloudflare Dashboard)
✅ LocalStorage 데이터 무결성
```

**테스트 URL**:
```
https://happy-tree-game.pages.dev/
https://happy-tree-game.pages.dev/game
https://happy-tree-game.pages.dev/simulator
https://happy-tree-game.pages.dev/api/farm/1/100/3?starPrice=2
```

---

## 🎯 다른 프로젝트 적용 시 고려사항

### 1. 이 프로젝트의 핵심 아이디어

```
✅ 설정(시뮬레이터)과 실행(게임)의 분리
✅ 백업 파일을 통한 초기값 관리
✅ LocalStorage 우선순위 설계
✅ 테스트 모드로 전체 검증 가능
✅ 독립성과 공유 자원의 균형
```

### 2. 재사용 가능한 패턴

**데이터 우선순위 패턴**:
```
게임 수정값 > 시뮬레이터 설정값 > API 기본값 > 백업 파일
```

**테스트 모드 패턴**:
```javascript
if (testMode) {
  // 조건 무시, 자원 차감 없음
  testStats.track(...)
} else {
  // 정상 로직
}
```

**농장별 독립성 패턴**:
```javascript
gameState = {
  shared: { /* 공유 자원 */ },
  farmSpecific: {
    1: { /* 농장 1 독립 자원 */ },
    2: { /* 농장 2 독립 자원 */ },
    // ...
  }
}
```

### 3. 새 프로젝트 시작 시

**체크리스트**:
```
1. ✅ 공유 자원 vs 독립 자원 정의
2. ✅ 초기값 백업 파일 생성
3. ✅ 데이터 우선순위 설계
4. ✅ 시뮬레이터 설계 (검증 로직)
5. ✅ 게임 설계 (실제 플레이)
6. ✅ 테스트 모드 구현
7. ✅ LocalStorage 키 네이밍 규칙
```

**네이밍 규칙**:
```
백업 파일: {entity}-initial.ts
설정 저장: {entity}_{id}_config
게임 저장: game_{entity}_{id}_{field}
전역 저장: {project_name}_game
```

---

## 📚 참고 자료

### 공식 문서
- Hono: https://hono.dev
- Cloudflare Workers: https://developers.cloudflare.com/workers
- Cloudflare Pages: https://developers.cloudflare.com/pages
- Wrangler: https://developers.cloudflare.com/workers/wrangler

### 프로젝트 URL
- Production: https://happy-tree-game.pages.dev
- GitHub: https://github.com/smee96/happytree_2026

---

## 📝 버전 히스토리

### v2.0 (2026-03-04)
- ✅ 농장별 독립 화분 시스템
- ✅ 공유 자원 설계 (지갑, 하트, 허용치, 별, 코인)
- ✅ 창고 시스템
- ✅ 농장 잠금/해제
- ✅ 테스트 모드 (모든 농장 즉시 해제)
- ✅ 레벨 설정 편집 (게임 내)
- ✅ 시뮬레이터-게임 연동

### v1.0 (2026-02-XX)
- ✅ 기본 게임 로직
- ✅ 시뮬레이터 구현
- ✅ API 엔드포인트
- ✅ Cloudflare Pages 배포

---

**작성자**: Claude (AI Assistant)  
**문서 버전**: 1.0  
**최종 수정**: 2026-03-04
