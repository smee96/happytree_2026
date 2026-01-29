import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { calculateCorrectReport } from './lib/correct-calculator';
import { calculateMultiPotReport } from './lib/multi-pot-calculator';
import { calculateFivePotsReport } from './lib/five-pots-calculator';

const app = new Hono();

// CORS 설정
app.use('/api/*', cors());

// ========== 순수 계산 API ==========

// 기본 버전: 1개 화분
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

// 다중 화분 버전 (화분 개수 지정 가능)
app.get('/api/multi-pot/:total_users/:max_pots', async (c) => {
  try {
    const totalUsers = parseInt(c.req.param('total_users'));
    const maxPots = parseInt(c.req.param('max_pots'));
    
    if (isNaN(totalUsers) || totalUsers < 1) {
      return c.json({ error: '유효한 인원수를 입력하세요 (1 이상)' }, 400);
    }

    if (totalUsers > 1000000) {
      return c.json({ error: '인원수가 너무 큽니다 (최대 1,000,000명)' }, 400);
    }

    if (isNaN(maxPots) || maxPots < 1 || maxPots > 10) {
      return c.json({ error: '화분 개수는 1~10 사이여야 합니다' }, 400);
    }

    const result = calculateMultiPotReport(totalUsers, maxPots);
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: `계산 실패: ${error}` }, 500);
  }
});

// 5개 화분 버전 (확장 우선 전략)
app.get('/api/five-pots/:total_users', async (c) => {
  try {
    const totalUsers = parseInt(c.req.param('total_users'));
    
    if (isNaN(totalUsers) || totalUsers < 1) {
      return c.json({ error: '유효한 인원수를 입력하세요 (1 이상)' }, 400);
    }

    if (totalUsers > 1000000) {
      return c.json({ error: '인원수가 너무 큽니다 (최대 1,000,000명)' }, 400);
    }

    const result = calculateFivePotsReport(totalUsers);
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: `계산 실패: ${error}` }, 500);
  }
});

// 루트 경로 - HTML UI
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HappyTree Calculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen p-8">
    <div class="max-w-6xl mx-auto">
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">🌳 HappyTree Calculator</h1>
            <p class="text-gray-600">레벨별 달성자 수 및 플랫폼 수익 계산기</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex gap-4 items-end">
                <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-2">총 입장 인원</label>
                    <input 
                        type="number" 
                        id="totalUsers" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="예: 1500"
                        min="1"
                        max="1000000"
                        value="1500"
                    >
                </div>
                <div class="w-48">
                    <label class="block text-sm font-medium text-gray-700 mb-2">화분 개수</label>
                    <select 
                        id="potMode" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="1">1개 (기본)</option>
                        <option value="5">5개 (확장 우선)</option>
                    </select>
                </div>
                <button 
                    onclick="calculate()"
                    class="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                    계산하기
                </button>
            </div>
        </div>

        <div id="loading" class="hidden text-center py-8">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p class="mt-4 text-gray-600">계산 중...</p>
        </div>

        <div id="result" class="hidden">
            <!-- 플랫폼 수익 카드 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">💰 플랫폼 수익</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">총 별 판매</div>
                        <div class="text-2xl font-bold text-blue-600" id="totalStars">-</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">별 수익</div>
                        <div class="text-2xl font-bold text-green-600" id="starRevenue">-</div>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">코인 지출</div>
                        <div class="text-2xl font-bold text-red-600" id="coinCost">-</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">순수익</div>
                        <div class="text-2xl font-bold text-purple-600" id="netRevenue">-</div>
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <span class="text-lg text-gray-700">수익률: </span>
                    <span class="text-2xl font-bold" id="profitMargin">-</span>
                </div>
            </div>

            <!-- 1번 사용자 수익 카드 -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-amber-200">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">👤 1번 사용자 수익</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">구매 별</div>
                        <div class="text-2xl font-bold text-amber-600" id="user1Stars">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">획득 코인</div>
                        <div class="text-2xl font-bold text-amber-600" id="user1Coins">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">보유 하트 ♥</div>
                        <div class="text-2xl font-bold text-pink-600" id="user1Hearts">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">하트허용치 🎯</div>
                        <div class="text-2xl font-bold text-indigo-600" id="user1Allowance">-</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">투자금</div>
                        <div class="text-2xl font-bold text-red-600" id="user1Investment">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">수익금</div>
                        <div class="text-2xl font-bold text-green-600" id="user1Return">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">순이익</div>
                        <div class="text-2xl font-bold" id="user1NetProfit">-</div>
                    </div>
                </div>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="text-center">
                        <span class="text-lg text-gray-700">최고 달성: </span>
                        <span class="text-xl font-bold text-amber-700" id="user1Level">-</span>
                    </div>
                    <div class="text-center">
                        <span class="text-lg text-gray-700">ROI: </span>
                        <span class="text-2xl font-bold" id="user1ROI">-</span>
                    </div>
                </div>
            </div>

            <!-- 256번 사용자 수익 카드 -->
            <div id="user256Card" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200 hidden">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">👤 256번 사용자 수익 <span class="text-sm text-gray-500">(농장2 시작)</span></h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">구매 별</div>
                        <div class="text-2xl font-bold text-blue-600" id="user256Stars">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">획득 코인</div>
                        <div class="text-2xl font-bold text-blue-600" id="user256Coins">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">보유 하트 ♥</div>
                        <div class="text-2xl font-bold text-pink-600" id="user256Hearts">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">하트허용치 🎯</div>
                        <div class="text-2xl font-bold text-indigo-600" id="user256Allowance">-</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">투자금</div>
                        <div class="text-2xl font-bold text-red-600" id="user256Investment">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">수익금</div>
                        <div class="text-2xl font-bold text-green-600" id="user256Return">-</div>
                    </div>
                    <div class="bg-white/70 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">순이익</div>
                        <div class="text-2xl font-bold" id="user256NetProfit">-</div>
                    </div>
                </div>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="text-center">
                        <span class="text-lg text-gray-700">최고 달성: </span>
                        <span class="text-xl font-bold text-blue-700" id="user256Level">-</span>
                    </div>
                    <div class="text-center">
                        <span class="text-lg text-gray-700">ROI: </span>
                        <span class="text-2xl font-bold" id="user256ROI">-</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">🌱 농장 1</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-3 py-2 text-left">레벨</th>
                                    <th class="px-3 py-2 text-right">달성자</th>
                                    <th class="px-3 py-2 text-right">총 별</th>
                                    <th class="px-3 py-2 text-right">총 코인</th>
                                </tr>
                            </thead>
                            <tbody id="farm1Table" class="divide-y divide-gray-200"></tbody>
                        </table>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">🌿 농장 2</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-3 py-2 text-left">레벨</th>
                                    <th class="px-3 py-2 text-right">달성자</th>
                                    <th class="px-3 py-2 text-right">총 별</th>
                                    <th class="px-3 py-2 text-right">총 코인</th>
                                </tr>
                            </thead>
                            <tbody id="farm2Table" class="divide-y divide-gray-200"></tbody>
                        </table>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">🌳 농장 3</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-3 py-2 text-left">레벨</th>
                                    <th class="px-3 py-2 text-right">달성자</th>
                                    <th class="px-3 py-2 text-right">총 별</th>
                                    <th class="px-3 py-2 text-right">총 코인</th>
                                </tr>
                            </thead>
                            <tbody id="farm3Table" class="divide-y divide-gray-200"></tbody>
                        </table>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">🌲 농장 4</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-3 py-2 text-left">레벨</th>
                                    <th class="px-3 py-2 text-right">달성자</th>
                                    <th class="px-3 py-2 text-right">총 별</th>
                                    <th class="px-3 py-2 text-right">총 코인</th>
                                </tr>
                            </thead>
                            <tbody id="farm4Table" class="divide-y divide-gray-200"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div id="error" class="hidden bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"></div>

        <!-- 보상 플랜 -->
        <div class="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">📋 농장별 보상 플랜</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 농장 1 -->
                <div>
                    <h3 class="text-lg font-bold text-green-700 mb-3">🌱 농장 1</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs border-collapse">
                            <thead>
                                <tr class="bg-green-50">
                                    <th class="border border-green-200 px-2 py-1">레벨</th>
                                    <th class="border border-green-200 px-2 py-1">필요 별</th>
                                    <th class="border border-green-200 px-2 py-1">필요 하트허용치</th>
                                    <th class="border border-green-200 px-2 py-1">보상 코인</th>
                                    <th class="border border-green-200 px-2 py-1">보상 하트</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td class="border px-2 py-1 text-center">Lv.1</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">1</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.2</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">2</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">3</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.3</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">4</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">14</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.4</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">8</td><td class="border px-2 py-1 text-right">6</td><td class="border px-2 py-1 text-right">69</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.5</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">16</td><td class="border px-2 py-1 text-right">12</td><td class="border px-2 py-1 text-right">344</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.6</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">32</td><td class="border px-2 py-1 text-right">24</td><td class="border px-2 py-1 text-right">1,719</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.7</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">64</td><td class="border px-2 py-1 text-right">48</td><td class="border px-2 py-1 text-right">8,594</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.8</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">128</td><td class="border px-2 py-1 text-right">96</td><td class="border px-2 py-1 text-right">X</td></tr>
                                <tr class="bg-green-100 font-bold"><td class="border px-2 py-1 text-center">합계</td><td class="border px-2 py-1 text-right">6</td><td class="border px-2 py-1 text-right">255</td><td class="border px-2 py-1 text-right">186</td><td class="border px-2 py-1 text-right">10,744</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 농장 2 -->
                <div>
                    <h3 class="text-lg font-bold text-blue-700 mb-3">🌿 농장 2</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs border-collapse">
                            <thead>
                                <tr class="bg-blue-50">
                                    <th class="border border-blue-200 px-2 py-1">레벨</th>
                                    <th class="border border-blue-200 px-2 py-1">필요 별</th>
                                    <th class="border border-blue-200 px-2 py-1">필요 하트허용치</th>
                                    <th class="border border-blue-200 px-2 py-1">보상 코인</th>
                                    <th class="border border-blue-200 px-2 py-1">보상 하트</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td class="border px-2 py-1 text-center">Lv.1</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">1</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.2</td><td class="border px-2 py-1 text-right">2</td><td class="border px-2 py-1 text-right">3</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">2</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.3</td><td class="border px-2 py-1 text-right">3</td><td class="border px-2 py-1 text-right">9</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">9</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.4</td><td class="border px-2 py-1 text-right">4</td><td class="border px-2 py-1 text-right">27</td><td class="border px-2 py-1 text-right">20</td><td class="border px-2 py-1 text-right">35</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.5</td><td class="border px-2 py-1 text-right">5</td><td class="border px-2 py-1 text-right">81</td><td class="border px-2 py-1 text-right">60</td><td class="border px-2 py-1 text-right">141</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.6</td><td class="border px-2 py-1 text-right">6</td><td class="border px-2 py-1 text-right">243</td><td class="border px-2 py-1 text-right">180</td><td class="border px-2 py-1 text-right">563</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.7</td><td class="border px-2 py-1 text-right">7</td><td class="border px-2 py-1 text-right">729</td><td class="border px-2 py-1 text-right">550</td><td class="border px-2 py-1 text-right">2,253</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.8</td><td class="border px-2 py-1 text-right">8</td><td class="border px-2 py-1 text-right">2,187</td><td class="border px-2 py-1 text-right">1,750</td><td class="border px-2 py-1 text-right">X</td></tr>
                                <tr class="bg-blue-100 font-bold"><td class="border px-2 py-1 text-center">합계</td><td class="border px-2 py-1 text-right">36</td><td class="border px-2 py-1 text-right">3,280</td><td class="border px-2 py-1 text-right">2,560</td><td class="border px-2 py-1 text-right">3,004</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 농장 3 -->
                <div>
                    <h3 class="text-lg font-bold text-emerald-700 mb-3">🌳 농장 3</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs border-collapse">
                            <thead>
                                <tr class="bg-emerald-50">
                                    <th class="border border-emerald-200 px-2 py-1">레벨</th>
                                    <th class="border border-emerald-200 px-2 py-1">필요 별</th>
                                    <th class="border border-emerald-200 px-2 py-1">필요 하트허용치</th>
                                    <th class="border border-emerald-200 px-2 py-1">보상 코인</th>
                                    <th class="border border-emerald-200 px-2 py-1">보상 하트</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td class="border px-2 py-1 text-center">Lv.1</td><td class="border px-2 py-1 text-right">2</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">1</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.2</td><td class="border px-2 py-1 text-right">4</td><td class="border px-2 py-1 text-right">4</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">2</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.3</td><td class="border px-2 py-1 text-right">6</td><td class="border px-2 py-1 text-right">16</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">5</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.4</td><td class="border px-2 py-1 text-right">8</td><td class="border px-2 py-1 text-right">64</td><td class="border px-2 py-1 text-right">50</td><td class="border px-2 py-1 text-right">15</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.5</td><td class="border px-2 py-1 text-right">10</td><td class="border px-2 py-1 text-right">256</td><td class="border px-2 py-1 text-right">190</td><td class="border px-2 py-1 text-right">45</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.6</td><td class="border px-2 py-1 text-right">12</td><td class="border px-2 py-1 text-right">1,024</td><td class="border px-2 py-1 text-right">770</td><td class="border px-2 py-1 text-right">134</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.7</td><td class="border px-2 py-1 text-right">14</td><td class="border px-2 py-1 text-right">4,096</td><td class="border px-2 py-1 text-right">3,070</td><td class="border px-2 py-1 text-right">401</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.8</td><td class="border px-2 py-1 text-right">16</td><td class="border px-2 py-1 text-right">16,384</td><td class="border px-2 py-1 text-right">13,110</td><td class="border px-2 py-1 text-right">X</td></tr>
                                <tr class="bg-emerald-100 font-bold"><td class="border px-2 py-1 text-center">합계</td><td class="border px-2 py-1 text-right">72</td><td class="border px-2 py-1 text-right">21,845</td><td class="border px-2 py-1 text-right">17,190</td><td class="border px-2 py-1 text-right">603</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 농장 4 -->
                <div>
                    <h3 class="text-lg font-bold text-teal-700 mb-3">🌲 농장 4</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs border-collapse">
                            <thead>
                                <tr class="bg-teal-50">
                                    <th class="border border-teal-200 px-2 py-1">레벨</th>
                                    <th class="border border-teal-200 px-2 py-1">필요 별</th>
                                    <th class="border border-teal-200 px-2 py-1">필요 하트허용치</th>
                                    <th class="border border-teal-200 px-2 py-1">보상 코인</th>
                                    <th class="border border-teal-200 px-2 py-1">보상 하트</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td class="border px-2 py-1 text-center">Lv.1</td><td class="border px-2 py-1 text-right">3</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">1</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.2</td><td class="border px-2 py-1 text-right">6</td><td class="border px-2 py-1 text-right">5</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">1</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.3</td><td class="border px-2 py-1 text-right">9</td><td class="border px-2 py-1 text-right">25</td><td class="border px-2 py-1 text-right">0</td><td class="border px-2 py-1 text-right">2</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.4</td><td class="border px-2 py-1 text-right">12</td><td class="border px-2 py-1 text-right">125</td><td class="border px-2 py-1 text-right">90</td><td class="border px-2 py-1 text-right">4</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.5</td><td class="border px-2 py-1 text-right">15</td><td class="border px-2 py-1 text-right">625</td><td class="border px-2 py-1 text-right">470</td><td class="border px-2 py-1 text-right">9</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.6</td><td class="border px-2 py-1 text-right">18</td><td class="border px-2 py-1 text-right">3,125</td><td class="border px-2 py-1 text-right">2,340</td><td class="border px-2 py-1 text-right">18</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.7</td><td class="border px-2 py-1 text-right">21</td><td class="border px-2 py-1 text-right">15,625</td><td class="border px-2 py-1 text-right">11,720</td><td class="border px-2 py-1 text-right">35</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.8</td><td class="border px-2 py-1 text-right">24</td><td class="border px-2 py-1 text-right">78,125</td><td class="border px-2 py-1 text-right">62,500</td><td class="border px-2 py-1 text-right">X</td></tr>
                                <tr class="bg-teal-100 font-bold"><td class="border px-2 py-1 text-center">합계</td><td class="border px-2 py-1 text-right">108</td><td class="border px-2 py-1 text-right">97,656</td><td class="border px-2 py-1 text-right">77,120</td><td class="border px-2 py-1 text-right">70</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="mt-6 text-center text-sm text-gray-600">
                <p>💰 화폐 체계: 별(★) $2/개 | 코인(◎) $0.10/개 | 하트(♥) 무료</p>
                <p class="mt-1">📌 레벨업 조건: 보유 하트 ≥ 필요 하트 AND 하트허용치 ≥ 필요 하트허용치 AND 별 ≥ 필요 별(Lv3부터)</p>
            </div>
        </div>
    </div>

    <script>
        async function calculate() {
            const totalUsers = document.getElementById('totalUsers').value;
            const potMode = document.getElementById('potMode').value;
            
            if (!totalUsers || totalUsers < 1) {
                showError('유효한 인원수를 입력하세요 (1 이상)');
                return;
            }

            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('result').classList.add('hidden');
            document.getElementById('error').classList.add('hidden');

            try {
                // 화분 개수에 따라 다른 API 호출
                const apiUrl = potMode === '5' 
                    ? \`/api/five-pots/\${totalUsers}\`
                    : \`/api/report/\${totalUsers}\`;
                
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '계산 실패');
                }

                displayResult(data);
            } catch (error) {
                showError(error.message);
            } finally {
                document.getElementById('loading').classList.add('hidden');
            }
        }

        function displayResult(data) {
            // 플랫폼 수익
            document.getElementById('totalStars').textContent = data.platform.total_stars_sold.toLocaleString() + '개';
            document.getElementById('starRevenue').textContent = '$' + data.platform.star_revenue_usd.toLocaleString();
            document.getElementById('coinCost').textContent = '$' + data.platform.coin_cost_usd.toLocaleString();
            document.getElementById('netRevenue').textContent = '$' + data.platform.net_revenue_usd.toLocaleString();
            
            const profitMargin = parseFloat(data.platform.profit_margin_percent);
            const profitColor = profitMargin >= 0 ? 'text-green-600' : 'text-red-600';
            document.getElementById('profitMargin').textContent = data.platform.profit_margin_percent + '%';
            document.getElementById('profitMargin').className = \`text-2xl font-bold \${profitColor}\`;

            // 1번 사용자 수익
            const user1 = data.user_1;
            document.getElementById('user1Stars').textContent = user1.stars_purchased.toLocaleString() + '개';
            document.getElementById('user1Coins').textContent = user1.coins_earned.toLocaleString() + '개';
            document.getElementById('user1Hearts').textContent = user1.hearts_balance.toLocaleString() + '개';
            document.getElementById('user1Allowance').textContent = user1.heart_allowance.toLocaleString();
            document.getElementById('user1Investment').textContent = '$' + user1.investment_usd.toLocaleString();
            document.getElementById('user1Return').textContent = '$' + user1.return_usd.toLocaleString();
            document.getElementById('user1NetProfit').textContent = '$' + user1.net_profit_usd.toLocaleString();
            
            const user1ROI = parseFloat(user1.roi_percent);
            const user1ROIColor = user1ROI >= 0 ? 'text-green-600' : 'text-red-600';
            document.getElementById('user1ROI').textContent = user1.roi_percent + '%';
            document.getElementById('user1ROI').className = \`text-2xl font-bold \${user1ROIColor}\`;
            
            const user1NetProfitValue = parseFloat(user1.net_profit_usd);
            const user1NetProfitColor = user1NetProfitValue >= 0 ? 'text-green-600' : 'text-red-600';
            document.getElementById('user1NetProfit').className = \`text-2xl font-bold \${user1NetProfitColor}\`;
            
            document.getElementById('user1Level').textContent = \`농장 \${user1.highest_farm} - Lv.\${user1.highest_level}\`;

            // 256번 사용자 수익 (256명 이상일 때만 표시)
            if (data.user_256) {
                const user256 = data.user_256;
                document.getElementById('user256Card').classList.remove('hidden');
                
                document.getElementById('user256Stars').textContent = user256.stars_purchased.toLocaleString() + '개';
                document.getElementById('user256Coins').textContent = user256.coins_earned.toLocaleString() + '개';
                document.getElementById('user256Hearts').textContent = user256.hearts_balance.toLocaleString() + '개';
                document.getElementById('user256Allowance').textContent = user256.heart_allowance.toLocaleString();
                document.getElementById('user256Investment').textContent = '$' + user256.investment_usd.toLocaleString();
                document.getElementById('user256Return').textContent = '$' + user256.return_usd.toLocaleString();
                document.getElementById('user256NetProfit').textContent = '$' + user256.net_profit_usd.toLocaleString();
                
                const user256ROI = parseFloat(user256.roi_percent);
                const user256ROIColor = user256ROI >= 0 ? 'text-green-600' : 'text-red-600';
                document.getElementById('user256ROI').textContent = user256.roi_percent + '%';
                document.getElementById('user256ROI').className = \`text-2xl font-bold \${user256ROIColor}\`;
                
                const user256NetProfitValue = parseFloat(user256.net_profit_usd);
                const user256NetProfitColor = user256NetProfitValue >= 0 ? 'text-green-600' : 'text-red-600';
                document.getElementById('user256NetProfit').className = \`text-2xl font-bold \${user256NetProfitColor}\`;
                
                document.getElementById('user256Level').textContent = \`농장 \${user256.highest_farm} - Lv.\${user256.highest_level}\`;
            } else {
                document.getElementById('user256Card').classList.add('hidden');
            }

            displayFarmTable('farm1Table', data.farm_1);
            displayFarmTable('farm2Table', data.farm_2);
            displayFarmTable('farm3Table', data.farm_3);
            displayFarmTable('farm4Table', data.farm_4);

            document.getElementById('result').classList.remove('hidden');
        }

        function displayFarmTable(tableId, farmData) {
            const tbody = document.getElementById(tableId);
            tbody.innerHTML = '';

            farmData.forEach(level => {
                if (level.achievers_count > 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td class="px-3 py-2">Lv.\${level.level}</td>
                        <td class="px-3 py-2 text-right">\${level.achievers_count.toLocaleString()}명</td>
                        <td class="px-3 py-2 text-right">\${level.total_stars_sold.toLocaleString()}</td>
                        <td class="px-3 py-2 text-right">\${level.total_coins_paid.toLocaleString()}</td>
                    \`;
                    tbody.appendChild(row);
                }
            });
        }

        function showError(message) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            document.getElementById('result').classList.add('hidden');
        }

        document.getElementById('totalUsers').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calculate();
            }
        });

        window.addEventListener('load', () => {
            calculate();
        });
    </script>
</body>
</html>`);
});

export default app;
