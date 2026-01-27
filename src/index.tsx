import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DatabaseHelper } from './lib/db-helper';
import { SimulationRunner } from './lib/simulator';
import { calculateFullReport } from './lib/level-achievement-calculator';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS 설정
app.use('/api/*', cors());

// ========== 순수 계산 API (DB 없음) ==========

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

    const result = calculateFullReport(totalUsers);
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: `계산 실패: ${error}` }, 500);
  }
});

// ========== 시뮬레이션 세션 관리 ==========

// 새 시뮬레이션 세션 생성
app.post('/api/sessions', async (c) => {
  try {
    const { name, daily_new_users, simulation_days } = await c.req.json();
    
    if (!name || !daily_new_users || !simulation_days) {
      return c.json({ error: '필수 파라미터가 누락되었습니다.' }, 400);
    }

    const dbHelper = new DatabaseHelper(c.env.DB);
    const sessionId = await dbHelper.createSession(name, daily_new_users, simulation_days);
    
    return c.json({ 
      success: true, 
      session_id: sessionId,
      message: '시뮬레이션 세션이 생성되었습니다.'
    });
  } catch (error) {
    return c.json({ error: `세션 생성 실패: ${error}` }, 500);
  }
});

// 모든 세션 조회
app.get('/api/sessions', async (c) => {
  try {
    const dbHelper = new DatabaseHelper(c.env.DB);
    const sessions = await dbHelper.getAllSessions();
    
    return c.json({ sessions });
  } catch (error) {
    return c.json({ error: `세션 조회 실패: ${error}` }, 500);
  }
});

// 특정 세션 조회
app.get('/api/sessions/:id', async (c) => {
  try {
    const sessionId = parseInt(c.req.param('id'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    const session = await dbHelper.getSession(sessionId);
    
    if (!session) {
      return c.json({ error: '세션을 찾을 수 없습니다.' }, 404);
    }
    
    return c.json({ session });
  } catch (error) {
    return c.json({ error: `세션 조회 실패: ${error}` }, 500);
  }
});

// ========== 시뮬레이션 실행 ==========

// 시뮬레이션 실행
app.post('/api/sessions/:id/run', async (c) => {
  try {
    const sessionId = parseInt(c.req.param('id'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    const runner = new SimulationRunner(dbHelper);
    
    const result = await runner.runSimulation(sessionId);
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: `시뮬레이션 실행 실패: ${error}` }, 500);
  }
});

// ========== 핵심 지표 조회 ==========

// 입력 인원수 N에 따른 핵심 지표 조회 (1번, 중간, 마지막, 플랫폼 수익)
app.get('/api/sessions/:id/key-metrics', async (c) => {
  try {
    const sessionId = parseInt(c.req.param('id'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    const users = await dbHelper.getUsersBySession(sessionId);
    
    if (users.length === 0) {
      return c.json({ error: '사용자가 없습니다. 먼저 시뮬레이션을 실행하세요.' }, 404);
    }

    const totalUsers = users.length;
    const middleIndex = Math.floor(totalUsers / 2);

    // 1번 사용자 (입장 순서 1)
    const user1 = users.find(u => u.entry_order === 1);
    const user1Progress = user1 ? await dbHelper.getUserProgress(user1.id) : [];
    const user1State = user1 ? await formatUserState(user1, user1Progress) : null;

    // 중간 사용자 (입장 순서 middleIndex + 1)
    const userMiddle = users.find(u => u.entry_order === middleIndex + 1);
    const userMiddleProgress = userMiddle ? await dbHelper.getUserProgress(userMiddle.id) : [];
    const userMiddleState = userMiddle ? await formatUserState(userMiddle, userMiddleProgress) : null;

    // 마지막 사용자 (입장 순서 totalUsers)
    const userLast = users.find(u => u.entry_order === totalUsers);
    const userLastProgress = userLast ? await dbHelper.getUserProgress(userLast.id) : [];
    const userLastState = userLast ? await formatUserState(userLast, userLastProgress) : null;

    // 플랫폼 수익 계산
    const totalStarsSold = users.reduce((sum, u) => sum + u.total_stars_purchased, 0);
    const totalCoinsPaid = users.reduce((sum, u) => sum + u.total_coins_earned, 0);
    const starRevenue = totalStarsSold * 3; // 별 1개 = $3
    const coinCost = totalCoinsPaid * 0.1; // 코인 1개 = $0.10
    const platformRevenue = starRevenue - coinCost;
    const profitMargin = starRevenue > 0 ? (platformRevenue / starRevenue * 100).toFixed(2) : '0.00';

    return c.json({
      total_users: totalUsers,
      user_1: user1State,
      user_middle: userMiddleState,
      user_last: userLastState,
      platform: {
        total_stars_sold: totalStarsSold,
        total_coins_paid: totalCoinsPaid,
        star_revenue: starRevenue,
        coin_cost: coinCost,
        net_revenue: platformRevenue,
        profit_margin_percent: profitMargin
      }
    });
  } catch (error) {
    return c.json({ error: `핵심 지표 조회 실패: ${error}` }, 500);
  }
});

// 사용자 상태 포맷 헬퍼 함수
async function formatUserState(user: any, progress: any[]) {
  const investment = user.total_stars_purchased * 3;
  const returns = user.total_coins_earned * 0.1;
  const netProfit = returns - investment;
  const roi = investment > 0 ? ((netProfit / investment) * 100).toFixed(2) : '0.00';

  // 가장 높은 레벨 찾기
  let highestFarm = 0;
  let highestLevel = 0;
  for (const p of progress) {
    if (p.farm_id > highestFarm || (p.farm_id === highestFarm && p.current_level > highestLevel)) {
      highestFarm = p.farm_id;
      highestLevel = p.current_level;
    }
  }

  return {
    user_id: user.id,
    entry_order: user.entry_order,
    entry_day: user.entry_day,
    // 별 (Stars)
    stars_owned: user.stars,
    stars_used: user.total_stars_purchased,
    // 코인 (Coins)
    coins_owned: user.coins,
    coins_earned: user.total_coins_earned,
    // 하트 (Hearts)
    hearts_owned: user.hearts,
    hearts_used: user.hearts, // 현재 사용한 하트는 별도로 추적하지 않음
    // 하트허용치 (Heart Allowance)
    heart_allowance_owned: user.heart_allowance,
    heart_allowance_used: 0, // TODO: 별도 계산 필요
    // 달성 레벨
    highest_farm: highestFarm,
    highest_level: highestLevel,
    level_display: `Farm ${highestFarm} Lv.${highestLevel}`,
    // 투자 수익
    investment_usd: investment,
    return_usd: returns,
    net_profit_usd: netProfit,
    roi_percent: roi,
    // 진행 상태
    farm_progress: progress.map(p => ({
      farm_id: p.farm_id,
      current_level: p.current_level,
      is_completed: p.is_completed === 1,
      is_unlocked: p.is_unlocked === 1
    }))
  };
}

// ========== 사용자 관리 ==========

// 세션의 모든 사용자 조회
app.get('/api/sessions/:id/users', async (c) => {
  try {
    const sessionId = parseInt(c.req.param('id'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    const users = await dbHelper.getUsersBySession(sessionId);
    
    return c.json({ users });
  } catch (error) {
    return c.json({ error: `사용자 조회 실패: ${error}` }, 500);
  }
});

// 특정 사용자 상세 조회
app.get('/api/users/:id', async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    
    const user = await dbHelper.getUser(userId);
    if (!user) {
      return c.json({ error: '사용자를 찾을 수 없습니다.' }, 404);
    }
    
    const progress = await dbHelper.getUserProgress(userId);
    
    return c.json({ user, progress });
  } catch (error) {
    return c.json({ error: `사용자 조회 실패: ${error}` }, 500);
  }
});

// 특정 사용자의 일별 히스토리 조회
app.get('/api/users/:id/history', async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    
    const user = await dbHelper.getUser(userId);
    if (!user) {
      return c.json({ error: '사용자를 찾을 수 없습니다.' }, 404);
    }
    
    // 레벨업 이력 조회
    const historyResult = await c.env.DB.prepare(`
      SELECT * FROM levelup_history 
      WHERE user_id = ? 
      ORDER BY simulation_day, created_at
    `).bind(userId).all();
    
    const history = historyResult.results;
    
    // 일별로 그룹화
    const dailyHistory: any = {};
    
    for (const record of history) {
      const day = record.simulation_day;
      if (!dailyHistory[day]) {
        dailyHistory[day] = [];
      }
      dailyHistory[day].push(record);
    }
    
    return c.json({ 
      user, 
      history,
      daily_history: dailyHistory
    });
  } catch (error) {
    return c.json({ error: `히스토리 조회 실패: ${error}` }, 500);
  }
});

// ========== 분석 ==========

// 사용자 분석 (투자 수익률)
app.get('/api/sessions/:id/analysis', async (c) => {
  try {
    const sessionId = parseInt(c.req.param('id'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    const runner = new SimulationRunner(dbHelper);
    
    const analysis = await runner.analyzeUsers(sessionId);
    
    // 통계 요약
    const summary = {
      total_users: analysis.length,
      profitable_users: analysis.filter(a => a.net_profit > 0).length,
      stuck_users: analysis.filter(a => a.is_stuck).length,
      avg_roi: analysis.length > 0 
        ? analysis.reduce((sum, a) => sum + a.roi, 0) / analysis.length 
        : 0,
      total_investment: analysis.reduce((sum, a) => sum + a.total_investment, 0),
      total_return: analysis.reduce((sum, a) => sum + a.total_return, 0),
    };
    
    return c.json({ analysis, summary });
  } catch (error) {
    return c.json({ error: `분석 실패: ${error}` }, 500);
  }
});

// 플랫폼 통계 조회
app.get('/api/sessions/:id/stats', async (c) => {
  try {
    const sessionId = parseInt(c.req.param('id'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    const stats = await dbHelper.getSimulationStats(sessionId);
    
    return c.json({ stats });
  } catch (error) {
    return c.json({ error: `통계 조회 실패: ${error}` }, 500);
  }
});

// ========== 농장 설정 조회 ==========

app.get('/api/farms', async (c) => {
  try {
    const dbHelper = new DatabaseHelper(c.env.DB);
    const farms = await dbHelper.getFarmConfigs();
    
    return c.json({ farms });
  } catch (error) {
    return c.json({ error: `농장 조회 실패: ${error}` }, 500);
  }
});

app.get('/api/farms/:farmId/levels', async (c) => {
  try {
    const farmId = parseInt(c.req.param('farmId'));
    const dbHelper = new DatabaseHelper(c.env.DB);
    const levels = await dbHelper.getAllLevelConfigs(farmId);
    
    return c.json({ levels });
  } catch (error) {
    return c.json({ error: `레벨 조회 실패: ${error}` }, 500);
  }
});

// ========== 메인 페이지 ==========

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HappyTree 시뮬레이션 엔진</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-green-600 text-white shadow-lg">
                <div class="container mx-auto px-4 py-6">
                    <h1 class="text-3xl font-bold flex items-center">
                        <i class="fas fa-tree mr-3"></i>
                        HappyTree 시뮬레이션 엔진
                    </h1>
                    <p class="text-green-100 mt-2">작물 키우기 게임 경제 시뮬레이터</p>
                </div>
            </header>

            <!-- Main Content -->
            <main class="container mx-auto px-4 py-8">
                <!-- Create Session Form -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4 flex items-center">
                        <i class="fas fa-plus-circle mr-2 text-green-600"></i>
                        새 시뮬레이션 생성
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">시뮬레이션 이름</label>
                            <input type="text" id="sessionName" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                   placeholder="예: 시나리오 1 - 100명/일">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">일일 신규 입장자 수</label>
                            <input type="number" id="dailyUsers" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                   placeholder="100" value="100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">시뮬레이션 기간 (일)</label>
                            <input type="number" id="simulationDays" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                   placeholder="30" value="30">
                        </div>
                    </div>
                    <button onclick="createSession()" 
                            class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                        <i class="fas fa-play mr-2"></i>생성 및 실행
                    </button>
                </div>

                <!-- Sessions List -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-2xl font-bold mb-4 flex items-center">
                        <i class="fas fa-list mr-2 text-blue-600"></i>
                        시뮬레이션 목록
                    </h2>
                    <div id="sessionsList" class="space-y-4">
                        <p class="text-gray-500">로딩 중...</p>
                    </div>
                </div>
            </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const API_BASE = '/api';

            // 세션 목록 로드
            async function loadSessions() {
                try {
                    const response = await axios.get(\`\${API_BASE}/sessions\`);
                    displaySessions(response.data.sessions);
                } catch (error) {
                    console.error('세션 로드 실패:', error);
                    document.getElementById('sessionsList').innerHTML = 
                        '<p class="text-red-500">세션을 불러올 수 없습니다.</p>';
                }
            }

            // 세션 목록 표시
            function displaySessions(sessions) {
                const container = document.getElementById('sessionsList');
                
                if (sessions.length === 0) {
                    container.innerHTML = '<p class="text-gray-500">시뮬레이션이 없습니다. 새로 생성해주세요.</p>';
                    return;
                }

                container.innerHTML = sessions.map(session => \`
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h3 class="text-lg font-bold text-gray-800">\${session.name}</h3>
                                <div class="mt-2 space-y-1 text-sm text-gray-600">
                                    <p><i class="fas fa-users w-5"></i> 일일 입장: \${session.daily_new_users}명</p>
                                    <p><i class="fas fa-calendar w-5"></i> 기간: \${session.simulation_days}일</p>
                                    <p><i class="fas fa-info-circle w-5"></i> 상태: 
                                        <span class="font-medium \${session.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}">
                                            \${session.status === 'completed' ? '완료' : '실행 중'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="viewAnalysis(\${session.id})" 
                                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                                    <i class="fas fa-chart-line mr-1"></i>분석
                                </button>
                            </div>
                        </div>
                    </div>
                \`).join('');
            }

            // 새 세션 생성 및 실행
            async function createSession() {
                const name = document.getElementById('sessionName').value;
                const dailyUsers = parseInt(document.getElementById('dailyUsers').value);
                const days = parseInt(document.getElementById('simulationDays').value);

                if (!name || !dailyUsers || !days) {
                    alert('모든 필드를 입력해주세요.');
                    return;
                }

                try {
                    // 세션 생성
                    const createResponse = await axios.post(\`\${API_BASE}/sessions\`, {
                        name,
                        daily_new_users: dailyUsers,
                        simulation_days: days
                    });

                    const sessionId = createResponse.data.session_id;
                    alert('시뮬레이션을 생성했습니다. 이제 실행합니다...');

                    // 시뮬레이션 실행
                    const runResponse = await axios.post(\`\${API_BASE}/sessions/\${sessionId}/run\`);
                    
                    if (runResponse.data.success) {
                        alert(runResponse.data.message);
                        loadSessions();
                        
                        // 입력 필드 초기화
                        document.getElementById('sessionName').value = '';
                    } else {
                        alert('시뮬레이션 실행 실패: ' + runResponse.data.message);
                    }
                } catch (error) {
                    console.error('오류:', error);
                    alert('오류가 발생했습니다: ' + error.message);
                }
            }

            // 분석 페이지로 이동
            function viewAnalysis(sessionId) {
                window.location.href = \`/analysis?session=\${sessionId}\`;
            }

            // 페이지 로드 시 세션 목록 로드
            loadSessions();
        </script>
    </body>
    </html>
  `);
});

// 분석 페이지
app.get('/analysis', (c) => {
  const sessionId = c.req.query('session');
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>시뮬레이션 분석 - HappyTree</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-green-600 text-white shadow-lg">
                <div class="container mx-auto px-4 py-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold flex items-center">
                                <i class="fas fa-chart-bar mr-3"></i>
                                시뮬레이션 분석
                            </h1>
                            <p class="text-green-100 mt-2" id="sessionInfo">세션 정보 로딩 중...</p>
                        </div>
                        <a href="/" class="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-50">
                            <i class="fas fa-arrow-left mr-2"></i>목록으로
                        </a>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="container mx-auto px-4 py-8">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600">총 사용자</p>
                                <p class="text-2xl font-bold" id="totalUsers">-</p>
                            </div>
                            <i class="fas fa-users text-3xl text-blue-500"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600">평균 ROI</p>
                                <p class="text-2xl font-bold" id="avgROI">-</p>
                            </div>
                            <i class="fas fa-percentage text-3xl text-green-500"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600">수익 사용자</p>
                                <p class="text-2xl font-bold" id="profitableUsers">-</p>
                            </div>
                            <i class="fas fa-arrow-up text-3xl text-green-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600">막힌 사용자</p>
                                <p class="text-2xl font-bold" id="stuckUsers">-</p>
                            </div>
                            <i class="fas fa-ban text-3xl text-red-500"></i>
                        </div>
                    </div>
                </div>

                <!-- Platform Revenue -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4 flex items-center">
                        <i class="fas fa-dollar-sign mr-2 text-green-600"></i>
                        플랫폼 수익 분석
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center p-4 bg-blue-50 rounded">
                            <p class="text-sm text-gray-600">총 별 판매</p>
                            <p class="text-3xl font-bold text-blue-600" id="totalStarsSold">-</p>
                            <p class="text-sm text-gray-500 mt-1" id="totalStarsRevenue">-</p>
                        </div>
                        <div class="text-center p-4 bg-red-50 rounded">
                            <p class="text-sm text-gray-600">총 코인 지급</p>
                            <p class="text-3xl font-bold text-red-600" id="totalCoinsPaid">-</p>
                            <p class="text-sm text-gray-500 mt-1" id="totalCoinsPayout">-</p>
                        </div>
                        <div class="text-center p-4 bg-green-50 rounded">
                            <p class="text-sm text-gray-600">플랫폼 순수익</p>
                            <p class="text-3xl font-bold text-green-600" id="platformRevenue">-</p>
                            <p class="text-sm text-gray-500 mt-1" id="revenueMargin">-</p>
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-xl font-bold mb-4">입장 순서별 ROI</h3>
                        <canvas id="roiChart"></canvas>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-xl font-bold mb-4">일별 플랫폼 수익</h3>
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>

                <!-- User Table -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-2xl font-bold mb-4 flex items-center">
                        <i class="fas fa-table mr-2 text-purple-600"></i>
                        사용자별 상세 분석
                    </h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 text-left">입장 순서</th>
                                    <th class="px-4 py-2 text-left">입장 일</th>
                                    <th class="px-4 py-2 text-right">투자액 ($)</th>
                                    <th class="px-4 py-2 text-right">수익 ($)</th>
                                    <th class="px-4 py-2 text-right">순이익 ($)</th>
                                    <th class="px-4 py-2 text-right">ROI (%)</th>
                                    <th class="px-4 py-2 text-center">상태</th>
                                </tr>
                            </thead>
                            <tbody id="userTableBody">
                                <tr><td colspan="7" class="text-center py-4 text-gray-500">로딩 중...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const API_BASE = '/api';
            const sessionId = ${sessionId};

            let roiChart, revenueChart;

            async function loadAnalysis() {
                try {
                    // 세션 정보 로드
                    const sessionResponse = await axios.get(\`\${API_BASE}/sessions/\${sessionId}\`);
                    const session = sessionResponse.data.session;
                    document.getElementById('sessionInfo').textContent = 
                        \`\${session.name} - \${session.daily_new_users}명/일, \${session.simulation_days}일\`;

                    // 분석 데이터 로드
                    const analysisResponse = await axios.get(\`\${API_BASE}/sessions/\${sessionId}/analysis\`);
                    const { analysis, summary } = analysisResponse.data;

                    // 통계 카드 업데이트
                    document.getElementById('totalUsers').textContent = summary.total_users.toLocaleString();
                    document.getElementById('avgROI').textContent = summary.avg_roi.toFixed(2) + '%';
                    document.getElementById('profitableUsers').textContent = summary.profitable_users.toLocaleString();
                    document.getElementById('stuckUsers').textContent = summary.stuck_users.toLocaleString();

                    // 플랫폼 통계 로드
                    const statsResponse = await axios.get(\`\${API_BASE}/sessions/\${sessionId}/stats\`);
                    const stats = statsResponse.data.stats;
                    
                    if (stats.length > 0) {
                        const lastStat = stats[stats.length - 1];
                        document.getElementById('totalStarsSold').textContent = lastStat.total_stars_sold.toLocaleString();
                        document.getElementById('totalStarsRevenue').textContent = 
                            '$' + (lastStat.total_stars_sold * 3).toLocaleString();
                        document.getElementById('totalCoinsPaid').textContent = lastStat.total_coins_paid.toLocaleString();
                        document.getElementById('totalCoinsPayout').textContent = 
                            '$' + (lastStat.total_coins_paid * 0.1).toLocaleString();
                        document.getElementById('platformRevenue').textContent = 
                            '$' + lastStat.platform_revenue.toLocaleString();
                        
                        const margin = lastStat.total_stars_sold > 0 
                            ? (lastStat.platform_revenue / (lastStat.total_stars_sold * 3) * 100).toFixed(1)
                            : 0;
                        document.getElementById('revenueMargin').textContent = '수익률 ' + margin + '%';
                    }

                    // 차트 그리기
                    drawROIChart(analysis);
                    drawRevenueChart(stats);

                    // 테이블 그리기
                    displayUserTable(analysis);

                } catch (error) {
                    console.error('분석 로드 실패:', error);
                    alert('분석 데이터를 불러올 수 없습니다.');
                }
            }

            function drawROIChart(analysis) {
                const ctx = document.getElementById('roiChart').getContext('2d');
                
                // 샘플링 (너무 많으면 100개만)
                const sampled = analysis.length > 100 
                    ? analysis.filter((_, i) => i % Math.ceil(analysis.length / 100) === 0)
                    : analysis;

                roiChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: sampled.map(a => a.entry_order),
                        datasets: [{
                            label: 'ROI (%)',
                            data: sampled.map(a => a.roi),
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: true }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: 'ROI (%)' }
                            },
                            x: {
                                title: { display: true, text: '입장 순서' }
                            }
                        }
                    }
                });
            }

            function drawRevenueChart(stats) {
                const ctx = document.getElementById('revenueChart').getContext('2d');
                
                revenueChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: stats.map(s => s.simulation_day + '일'),
                        datasets: [{
                            label: '플랫폼 수익 ($)',
                            data: stats.map(s => s.platform_revenue),
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: true }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: '수익 ($)' }
                            }
                        }
                    }
                });
            }

            function displayUserTable(analysis) {
                const tbody = document.getElementById('userTableBody');
                
                // 상위 50명만 표시
                const top50 = analysis.slice(0, 50);
                
                tbody.innerHTML = top50.map(user => \`
                    <tr class="border-t hover:bg-gray-50">
                        <td class="px-4 py-2">#\${user.entry_order}</td>
                        <td class="px-4 py-2">\${user.entry_day}일차</td>
                        <td class="px-4 py-2 text-right">$\${user.total_investment.toFixed(2)}</td>
                        <td class="px-4 py-2 text-right">$\${user.total_return.toFixed(2)}</td>
                        <td class="px-4 py-2 text-right \${user.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}">
                            $\${user.net_profit.toFixed(2)}
                        </td>
                        <td class="px-4 py-2 text-right font-medium \${user.roi >= 0 ? 'text-green-600' : 'text-red-600'}">
                            \${user.roi.toFixed(2)}%
                        </td>
                        <td class="px-4 py-2 text-center">
                            \${user.is_stuck 
                                ? '<span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">막힘</span>'
                                : '<span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">진행중</span>'
                            }
                        </td>
                    </tr>
                \`).join('');

                if (analysis.length > 50) {
                    tbody.innerHTML += \`
                        <tr class="border-t">
                            <td colspan="7" class="px-4 py-3 text-center text-gray-500">
                                ... 외 \${analysis.length - 50}명 (상위 50명만 표시)
                            </td>
                        </tr>
                    \`;
                }
            }

            // 페이지 로드 시 분석 로드
            loadAnalysis();
        </script>
    </body>
    </html>
  `);
});

export default app;
