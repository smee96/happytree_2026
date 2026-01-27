import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { calculateCorrectReport } from './lib/correct-calculator';

const app = new Hono();

// CORS 설정
app.use('/api/*', cors());

// ========== 순수 계산 API ==========

// 입력 인원수에 따른 레벨별 달성자 수 및 플랫폼 수익 계산
app.get('/api/report/:total_users', async (c) => {
  try {
    const totalUsers = parseInt(c.req.param('total_users'));
    
    if (isNaN(totalUsers) || totalUsers < 1) {
      return c.json({ error: '유효한 인원수를 입력하세요 (1 이상)' }, 400);
    }

    if (totalUsers > 1000000) {
      return c.json({ error: '인원수가 너무 큽니다 (최대 1,000,000명)' }, 400);
    }

    const result = calculateCorrectReport(totalUsers);
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: `계산 실패: ${error}` }, 500);
  }
});

// 루트 경로 - API 안내
app.get('/', (c) => {
  return c.json({
    name: 'HappyTree Calculator API',
    version: '1.0.0',
    description: '레벨별 달성자 수 및 플랫폼 수익 계산',
    endpoints: {
      'GET /api/report/:total_users': '입력 인원수에 따른 계산 결과',
    },
    example: 'GET /api/report/1500',
    github: 'https://github.com/smee96/happytree_2026'
  });
});

export default app;
