import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { calculateCorrectReport } from './lib/correct-calculator';
import { calculateMultiPotReport } from './lib/multi-pot-calculator';
import { calculateFivePotsReport } from './lib/five-pots-calculator';
import { calculateSingleFarm, FARM_LEVELS } from './lib/farm-calculator';
import { generateFarmUITemplate } from './ui-template';
import { mainPageTemplate } from './ui-main';
import { gamePageTemplate } from './ui-game';

const app = new Hono();

// CORS 설정
app.use('/api/*', cors());

// ========== 순수 계산 API ==========

// 기본 버전: 1개 화분
app.get('/api/report/:total_users', async (c) => {
  try {
    const totalUsers = parseInt(c.req.param('total_users'));
    const starPrice = parseFloat(c.req.query('starPrice') || '2');
    
    if (!totalUsers || totalUsers < 1 || totalUsers > 1000000) {
      return c.json({ error: '사용자 수는 1~1,000,000 사이여야 합니다' }, 400);
    }
    
    if (starPrice < 1 || starPrice > 5) {
      return c.json({ error: '별 가격은 $1~$5 사이여야 합니다' }, 400);
    }
    
    const result = calculateCorrectReport(totalUsers, starPrice);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: '계산 실패: ' + error.message }, 500);
  }
});

// 멀티화분 버전: 1~10개 화분
app.get('/api/multi-pot/:total_users/:max_pots', async (c) => {
  try {
    const totalUsers = parseInt(c.req.param('total_users'));
    const maxPots = parseInt(c.req.param('max_pots'));
    const starPrice = parseFloat(c.req.query('starPrice') || '2');
    
    if (!totalUsers || totalUsers < 1 || totalUsers > 1000000) {
      return c.json({ error: '사용자 수는 1~1,000,000 사이여야 합니다' }, 400);
    }
    
    if (!maxPots || maxPots < 1 || maxPots > 10) {
      return c.json({ error: '화분 개수는 1~10 사이여야 합니다' }, 400);
    }
    
    if (starPrice < 1 || starPrice > 5) {
      return c.json({ error: '별 가격은 $1~$5 사이여야 합니다' }, 400);
    }
    
    const result = calculateMultiPotReport(totalUsers, maxPots, starPrice);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: '계산 실패: ' + error.message }, 500);
  }
});

// 5개 화분 고정 버전
app.get('/api/five-pots/:total_users', async (c) => {
  try {
    const totalUsers = parseInt(c.req.param('total_users'));
    const starPrice = parseFloat(c.req.query('starPrice') || '2');
    
    if (!totalUsers || totalUsers < 1 || totalUsers > 1000000) {
      return c.json({ error: '사용자 수는 1~1,000,000 사이여야 합니다' }, 400);
    }
    
    if (starPrice < 1 || starPrice > 5) {
      return c.json({ error: '별 가격은 $1~$5 사이여야 합니다' }, 400);
    }
    
    const result = calculateFivePotsReport(totalUsers, starPrice);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: '계산 실패: ' + error.message }, 500);
  }
});

// 농장별 독립 계산 API (GET - 기본 레벨 사용)
app.get('/api/farm/:farm_id/:total_users/:max_pots', async (c) => {
  try {
    const farmId = parseInt(c.req.param('farm_id'));
    const totalUsers = parseInt(c.req.param('total_users'));
    const maxPots = parseInt(c.req.param('max_pots'));
    const starPrice = parseFloat(c.req.query('starPrice') || '2');
    const initialHearts = parseFloat(c.req.query('initialHearts') || '300000');
    
    if (!farmId || farmId < 1 || farmId > 4) {
      return c.json({ error: '농장 ID는 1~4 사이여야 합니다' }, 400);
    }
    
    if (!totalUsers || totalUsers < 1 || totalUsers > 1000000) {
      return c.json({ error: '사용자 수는 1~1,000,000 사이여야 합니다' }, 400);
    }
    
    if (!maxPots || maxPots < 1 || maxPots > 10) {
      return c.json({ error: '화분 개수는 1~10 사이여야 합니다' }, 400);
    }
    
    if (starPrice < 0.1 || starPrice > 100) {
      return c.json({ error: '별 가격은 $0.1~$100 사이여야 합니다' }, 400);
    }
    
    const result = calculateSingleFarm(farmId, totalUsers, maxPots, starPrice, initialHearts);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: '계산 실패: ' + error.message }, 500);
  }
});

// 농장별 독립 계산 API (POST - 커스텀 레벨 사용)
app.post('/api/farm/:farm_id/:total_users/:max_pots', async (c) => {
  try {
    const farmId = parseInt(c.req.param('farm_id'));
    const totalUsers = parseInt(c.req.param('total_users'));
    const maxPots = parseInt(c.req.param('max_pots'));
    const starPrice = parseFloat(c.req.query('starPrice') || '2');
    const initialHearts = parseFloat(c.req.query('initialHearts') || '300000');
    
    const body = await c.req.json();
    const customLevels = body.levels;
    
    if (!farmId || farmId < 1 || farmId > 4) {
      return c.json({ error: '농장 ID는 1~4 사이여야 합니다' }, 400);
    }
    
    if (!totalUsers || totalUsers < 1 || totalUsers > 1000000) {
      return c.json({ error: '사용자 수는 1~1,000,000 사이여야 합니다' }, 400);
    }
    
    if (!maxPots || maxPots < 1 || maxPots > 10) {
      return c.json({ error: '화분 개수는 1~10 사이여야 합니다' }, 400);
    }
    
    if (starPrice < 0.1 || starPrice > 100) {
      return c.json({ error: '별 가격은 $0.1~$100 사이여야 합니다' }, 400);
    }
    
    const result = calculateSingleFarm(farmId, totalUsers, maxPots, starPrice, initialHearts, customLevels);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: '계산 실패: ' + error.message }, 500);
  }
});

// 농장 레벨 정보 API (게임용)
app.get('/api/farm-levels', (c) => {
  return c.json(FARM_LEVELS);
});

// 루트 경로 - 메인 페이지
app.get('/', (c) => {
  return c.html(mainPageTemplate);
});

// 게임 페이지
app.get('/game', (c) => {
  return c.html(gamePageTemplate);
});

// 시뮬레이터 페이지
app.get('/simulator', (c) => {
  return c.html(generateFarmUITemplate());
});

export default app;
