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
                                <tr><td class="border px-2 py-1 text-center">Lv.5</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">16</td><td class="border px-2 py-1 text-right">18</td><td class="border px-2 py-1 text-right">222</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.6</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">32</td><td class="border px-2 py-1 text-right">54</td><td class="border px-2 py-1 text-right">887</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.7</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">64</td><td class="border px-2 py-1 text-right">162</td><td class="border px-2 py-1 text-right">3,549</td></tr>
                                <tr><td class="border px-2 py-1 text-center">Lv.8</td><td class="border px-2 py-1 text-right">1</td><td class="border px-2 py-1 text-right">128</td><td class="border px-2 py-1 text-right">96</td><td class="border px-2 py-1 text-right">0</td></tr>
                                <tr class="bg-green-100 font-bold"><td class="border px-2 py-1 text-center">합계</td><td class="border px-2 py-1 text-right">6</td><td class="border px-2 py-1 text-right">255</td><td class="border px-2 py-1 text-right">336</td><td class="border px-2 py-1 text-right">4,745</td></tr>
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
                                <tr><td class="border px-2 py-1 text-center">Lv.8</td><td class="border px-2 py-1 text-right">8</td><td class="border px-2 py-1 text-right">2,187</td><td class="border px-2 py-1 text-right">1,750</td><td class="border px-2 py-1 text-right">0</td></tr>
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
                                <tr><td class="border px-2 py-1 text-center">Lv.8</td><td class="border px-2 py-1 text-right">16</td><td class="border px-2 py-1 text-right">16,384</td><td class="border px-2 py-1 text-right">13,110</td><td class="border px-2 py-1 text-right">0</td></tr>
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
                                <tr><td class="border px-2 py-1 text-center">Lv.8</td><td class="border px-2 py-1 text-right">24</td><td class="border px-2 py-1 text-right">78,125</td><td class="border px-2 py-1 text-right">62,500</td><td class="border px-2 py-1 text-right">0</td></tr>
                                <tr class="bg-teal-100 font-bold"><td class="border px-2 py-1 text-center">합계</td><td class="border px-2 py-1 text-right">108</td><td class="border px-2 py-1 text-right">97,656</td><td class="border px-2 py-1 text-right">77,120</td><td class="border px-2 py-1 text-right">70</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="mt-6 text-center text-sm text-gray-600">
                <p>💰 화폐 체계: 별(★) $3/개 | 코인(◎) $0.10/개 | 하트(♥) 무료</p>
                <p class="mt-1">📌 레벨업 조건: 보유 하트 ≥ 필요 하트 AND 하트허용치 ≥ 필요 하트허용치 AND 별 ≥ 필요 별(Lv3부터)</p>
            </div>
        </div>
    </div>

    <script>
        async function calculate() {
            const totalUsers = document.getElementById('totalUsers').value;
            
            if (!totalUsers || totalUsers < 1) {
                showError('유효한 인원수를 입력하세요 (1 이상)');
                return;
            }

            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('result').classList.add('hidden');
            document.getElementById('error').classList.add('hidden');

            try {
                const response = await fetch(\`/api/report/\${totalUsers}\`);
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
            document.getElementById('totalStars').textContent = data.platform.total_stars_sold.toLocaleString() + '개';
            document.getElementById('starRevenue').textContent = '$' + data.platform.star_revenue_usd.toLocaleString();
            document.getElementById('coinCost').textContent = '$' + data.platform.coin_cost_usd.toLocaleString();
            document.getElementById('netRevenue').textContent = '$' + data.platform.net_revenue_usd.toLocaleString();
            
            const profitMargin = parseFloat(data.platform.profit_margin_percent);
            const profitColor = profitMargin >= 0 ? 'text-green-600' : 'text-red-600';
            document.getElementById('profitMargin').textContent = data.platform.profit_margin_percent + '%';
            document.getElementById('profitMargin').className = \`text-2xl font-bold \${profitColor}\`;

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
