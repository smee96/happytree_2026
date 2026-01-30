import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { calculateCorrectReport } from './lib/correct-calculator';
import { calculateMultiPotReport } from './lib/multi-pot-calculator';
import { calculateFivePotsReport } from './lib/five-pots-calculator';
import { calculateSingleFarm } from './lib/farm-calculator';
import { farmUITemplate } from './ui-template';

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

// 농장별 독립 계산 API
app.get('/api/farm/:farm_id/:total_users/:max_pots', async (c) => {
  try {
    const farmId = parseInt(c.req.param('farm_id'));
    const totalUsers = parseInt(c.req.param('total_users'));
    const maxPots = parseInt(c.req.param('max_pots'));
    const starPrice = parseFloat(c.req.query('starPrice') || '2');
    
    if (!farmId || farmId < 1 || farmId > 4) {
      return c.json({ error: '농장 ID는 1~4 사이여야 합니다' }, 400);
    }
    
    if (!totalUsers || totalUsers < 1 || totalUsers > 1000000) {
      return c.json({ error: '사용자 수는 1~1,000,000 사이여야 합니다' }, 400);
    }
    
    if (!maxPots || maxPots < 1 || maxPots > 10) {
      return c.json({ error: '화분 개수는 1~10 사이여야 합니다' }, 400);
    }
    
    if (starPrice < 1 || starPrice > 5) {
      return c.json({ error: '별 가격은 $1~$5 사이여야 합니다' }, 400);
    }
    
    const result = calculateSingleFarm(farmId, totalUsers, maxPots, starPrice);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: '계산 실패: ' + error.message }, 500);
  }
});

// 루트 경로 - 농장별 독립 시뮬레이터 UI
app.get('/', (c) => {
  return c.html(farmUITemplate);
});

export default app;
