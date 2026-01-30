export const farmUITemplate = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HappyTree - 농장별 시뮬레이터</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .tab-button { 
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            transition: all 0.2s;
        }
        .tab-button.active { 
            background-color: white;
            color: #059669;
            border-top: 4px solid #059669;
        }
        .tab-button.inactive { 
            background-color: #e5e7eb;
            color: #6b7280;
        }
        .tab-button.inactive:hover { 
            background-color: #d1d5db;
        }
        .tab-content { 
            display: none;
        }
        .tab-content.active { 
            display: block;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen p-4">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-6">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">🌳 HappyTree - 농장별 시뮬레이터</h1>
            <p class="text-gray-600">각 농장은 독립적으로 운영됩니다. 하트허용치는 같은 농장 내에서만 증가합니다.</p>
        </div>

        <!-- Farm Tabs -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div class="flex border-b bg-gray-100">
                <button class="tab-button active" onclick="switchTab(1)">🌱 농장 1</button>
                <button class="tab-button inactive" onclick="switchTab(2)">🌿 농장 2</button>
                <button class="tab-button inactive" onclick="switchTab(3)">🌳 농장 3</button>
                <button class="tab-button inactive" onclick="switchTab(4)">🌲 농장 4</button>
            </div>

            <!-- Farm 1 Content -->
            <div id="farm-1" class="tab-content active p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">입장 인원</label>
                        <input type="number" id="users-1" class="w-full px-4 py-2 border rounded-lg" value="100" min="1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">화분 개수</label>
                        <select id="pots-1" class="w-full px-4 py-2 border rounded-lg">
                            <option value="1">1개</option>
                            <option value="2">2개</option>
                            <option value="3" selected>3개</option>
                            <option value="4">4개</option>
                            <option value="5">5개</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">별 가격 ($)</label>
                        <select id="price-1" class="w-full px-4 py-2 border rounded-lg">
                            <option value="1">$1</option>
                            <option value="2" selected>$2</option>
                            <option value="3">$3</option>
                            <option value="4">$4</option>
                            <option value="5">$5</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="calculate(1)" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            계산하기
                        </button>
                    </div>
                </div>
                
                <div id="loading-1" class="hidden text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                </div>
                
                <div id="result-1" class="hidden">
                    <!-- Platform Revenue -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-4 border-2 border-green-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">💰 플랫폼 수익</h3>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">별 판매</div>
                                <div class="text-lg font-bold text-blue-600" id="platform-stars-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">별 수익</div>
                                <div class="text-lg font-bold text-green-600" id="platform-revenue-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">코인 지출</div>
                                <div class="text-lg font-bold text-red-600" id="platform-cost-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">순수익</div>
                                <div class="text-lg font-bold text-purple-600" id="platform-net-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">수익률</div>
                                <div class="text-lg font-bold" id="platform-margin-1">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- User 1 Revenue -->
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-4 border-2 border-amber-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">👤 1번 사용자 수익</h3>
                        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">화분 수</div>
                                <div class="text-lg font-bold text-indigo-600" id="user-pots-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">최고 레벨</div>
                                <div class="text-lg font-bold text-purple-600" id="user-level-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">구매 별</div>
                                <div class="text-lg font-bold text-blue-600" id="user-stars-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">투자금</div>
                                <div class="text-lg font-bold text-red-600" id="user-investment-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">수익금</div>
                                <div class="text-lg font-bold text-green-600" id="user-return-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">ROI</div>
                                <div class="text-lg font-bold" id="user-roi-1">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reward Plan Farm 1 -->
                    <div class="bg-white rounded-lg p-6 border-2 border-green-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">🌱 농장 1 보상 플랜</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-green-100">
                                    <tr>
                                        <th class="px-3 py-2 text-left">레벨</th>
                                        <th class="px-3 py-2 text-right">필요 별</th>
                                        <th class="px-3 py-2 text-right">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-right">보상 코인</th>
                                        <th class="px-3 py-2 text-right">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y">
                                    <tr><td class="px-3 py-2">Lv.1</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">1</td></tr>
                                    <tr><td class="px-3 py-2">Lv.2</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">3</td></tr>
                                    <tr><td class="px-3 py-2">Lv.3</td><td class="px-3 py-2 text-right">1</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">14</td></tr>
                                    <tr><td class="px-3 py-2">Lv.4</td><td class="px-3 py-2 text-right">1</td><td class="px-3 py-2 text-right">15</td><td class="px-3 py-2 text-right">6</td><td class="px-3 py-2 text-right">69</td></tr>
                                    <tr><td class="px-3 py-2">Lv.5</td><td class="px-3 py-2 text-right">1</td><td class="px-3 py-2 text-right">23</td><td class="px-3 py-2 text-right">12</td><td class="px-3 py-2 text-right">344</td></tr>
                                    <tr><td class="px-3 py-2">Lv.6</td><td class="px-3 py-2 text-right">1</td><td class="px-3 py-2 text-right">39</td><td class="px-3 py-2 text-right">24</td><td class="px-3 py-2 text-right">1,719</td></tr>
                                    <tr><td class="px-3 py-2">Lv.7</td><td class="px-3 py-2 text-right">1</td><td class="px-3 py-2 text-right">71</td><td class="px-3 py-2 text-right">48</td><td class="px-3 py-2 text-right">8,594</td></tr>
                                    <tr><td class="px-3 py-2">Lv.8</td><td class="px-3 py-2 text-right">1</td><td class="px-3 py-2 text-right">135</td><td class="px-3 py-2 text-right">96</td><td class="px-3 py-2 text-right">X</td></tr>
                                    <tr class="bg-green-50 font-bold">
                                        <td class="px-3 py-2">합계</td>
                                        <td class="px-3 py-2 text-right">6</td>
                                        <td class="px-3 py-2 text-right">283</td>
                                        <td class="px-3 py-2 text-right">186</td>
                                        <td class="px-3 py-2 text-right">10,744</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Farm 2 Content -->
            <div id="farm-2" class="tab-content p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">입장 인원</label>
                        <input type="number" id="users-2" class="w-full px-4 py-2 border rounded-lg" value="100" min="1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">화분 개수</label>
                        <select id="pots-2" class="w-full px-4 py-2 border rounded-lg">
                            <option value="1">1개</option>
                            <option value="2">2개</option>
                            <option value="3" selected>3개</option>
                            <option value="4">4개</option>
                            <option value="5">5개</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">별 가격 ($)</label>
                        <select id="price-2" class="w-full px-4 py-2 border rounded-lg">
                            <option value="1">$1</option>
                            <option value="2" selected>$2</option>
                            <option value="3">$3</option>
                            <option value="4">$4</option>
                            <option value="5">$5</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="calculate(2)" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            계산하기
                        </button>
                    </div>
                </div>
                
                <div id="loading-2" class="hidden text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                </div>
                
                <div id="result-2" class="hidden">
                    <!-- Platform Revenue -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-4 border-2 border-green-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">💰 플랫폼 수익</h3>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">별 판매</div>
                                <div class="text-lg font-bold text-blue-600" id="platform-stars-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">별 수익</div>
                                <div class="text-lg font-bold text-green-600" id="platform-revenue-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">코인 지출</div>
                                <div class="text-lg font-bold text-red-600" id="platform-cost-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">순수익</div>
                                <div class="text-lg font-bold text-purple-600" id="platform-net-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">수익률</div>
                                <div class="text-lg font-bold" id="platform-margin-2">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- User 1 Revenue -->
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-4 border-2 border-amber-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">👤 1번 사용자 수익</h3>
                        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">화분 수</div>
                                <div class="text-lg font-bold text-indigo-600" id="user-pots-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">최고 레벨</div>
                                <div class="text-lg font-bold text-purple-600" id="user-level-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">구매 별</div>
                                <div class="text-lg font-bold text-blue-600" id="user-stars-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">투자금</div>
                                <div class="text-lg font-bold text-red-600" id="user-investment-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">수익금</div>
                                <div class="text-lg font-bold text-green-600" id="user-return-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">ROI</div>
                                <div class="text-lg font-bold" id="user-roi-2">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reward Plan Farm 2 -->
                    <div class="bg-white rounded-lg p-6 border-2 border-blue-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">🌿 농장 2 보상 플랜</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-blue-100">
                                    <tr>
                                        <th class="px-3 py-2 text-left">레벨</th>
                                        <th class="px-3 py-2 text-right">필요 별</th>
                                        <th class="px-3 py-2 text-right">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-right">보상 코인</th>
                                        <th class="px-3 py-2 text-right">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y">
                                    <tr><td class="px-3 py-2">Lv.1</td><td class="px-3 py-2 text-right">1</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">1</td></tr>
                                    <tr><td class="px-3 py-2">Lv.2</td><td class="px-3 py-2 text-right">2</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">2</td></tr>
                                    <tr><td class="px-3 py-2">Lv.3</td><td class="px-3 py-2 text-right">3</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">9</td></tr>
                                    <tr><td class="px-3 py-2">Lv.4</td><td class="px-3 py-2 text-right">4</td><td class="px-3 py-2 text-right">40</td><td class="px-3 py-2 text-right">10</td><td class="px-3 py-2 text-right">35</td></tr>
                                    <tr><td class="px-3 py-2">Lv.5</td><td class="px-3 py-2 text-right">5</td><td class="px-3 py-2 text-right">94</td><td class="px-3 py-2 text-right">30</td><td class="px-3 py-2 text-right">141</td></tr>
                                    <tr><td class="px-3 py-2">Lv.6</td><td class="px-3 py-2 text-right">6</td><td class="px-3 py-2 text-right">256</td><td class="px-3 py-2 text-right">90</td><td class="px-3 py-2 text-right">563</td></tr>
                                    <tr><td class="px-3 py-2">Lv.7</td><td class="px-3 py-2 text-right">7</td><td class="px-3 py-2 text-right">742</td><td class="px-3 py-2 text-right">275</td><td class="px-3 py-2 text-right">2,253</td></tr>
                                    <tr><td class="px-3 py-2">Lv.8</td><td class="px-3 py-2 text-right">8</td><td class="px-3 py-2 text-right">2,200</td><td class="px-3 py-2 text-right">875</td><td class="px-3 py-2 text-right">X</td></tr>
                                    <tr class="bg-blue-50 font-bold">
                                        <td class="px-3 py-2">합계</td>
                                        <td class="px-3 py-2 text-right">36</td>
                                        <td class="px-3 py-2 text-right">3,332</td>
                                        <td class="px-3 py-2 text-right">1,280</td>
                                        <td class="px-3 py-2 text-right">3,004</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Farm 3 Content -->
            <div id="farm-3" class="tab-content p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">입장 인원</label>
                        <input type="number" id="users-3" class="w-full px-4 py-2 border rounded-lg" value="100" min="1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">화분 개수</label>
                        <select id="pots-3" class="w-full px-4 py-2 border rounded-lg">
                            <option value="1">1개</option>
                            <option value="2">2개</option>
                            <option value="3" selected>3개</option>
                            <option value="4">4개</option>
                            <option value="5">5개</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">별 가격 ($)</label>
                        <select id="price-3" class="w-full px-4 py-2 border rounded-lg">
                            <option value="1">$1</option>
                            <option value="2" selected>$2</option>
                            <option value="3">$3</option>
                            <option value="4">$4</option>
                            <option value="5">$5</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="calculate(3)" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            계산하기
                        </button>
                    </div>
                </div>
                
                <div id="loading-3" class="hidden text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                </div>
                
                <div id="result-3" class="hidden">
                    <!-- Platform Revenue -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-4 border-2 border-green-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">💰 플랫폼 수익</h3>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">별 판매</div>
                                <div class="text-lg font-bold text-blue-600" id="platform-stars-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">별 수익</div>
                                <div class="text-lg font-bold text-green-600" id="platform-revenue-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">코인 지출</div>
                                <div class="text-lg font-bold text-red-600" id="platform-cost-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">순수익</div>
                                <div class="text-lg font-bold text-purple-600" id="platform-net-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">수익률</div>
                                <div class="text-lg font-bold" id="platform-margin-3">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- User 1 Revenue -->
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-4 border-2 border-amber-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">👤 1번 사용자 수익</h3>
                        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">화분 수</div>
                                <div class="text-lg font-bold text-indigo-600" id="user-pots-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">최고 레벨</div>
                                <div class="text-lg font-bold text-purple-600" id="user-level-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">구매 별</div>
                                <div class="text-lg font-bold text-blue-600" id="user-stars-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">투자금</div>
                                <div class="text-lg font-bold text-red-600" id="user-investment-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">수익금</div>
                                <div class="text-lg font-bold text-green-600" id="user-return-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">ROI</div>
                                <div class="text-lg font-bold" id="user-roi-3">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reward Plan Farm 3 -->
                    <div class="bg-white rounded-lg p-6 border-2 border-emerald-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">🌳 농장 3 보상 플랜</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-emerald-100">
                                    <tr>
                                        <th class="px-3 py-2 text-left">레벨</th>
                                        <th class="px-3 py-2 text-right">필요 별</th>
                                        <th class="px-3 py-2 text-right">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-right">보상 코인</th>
                                        <th class="px-3 py-2 text-right">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y">
                                    <tr><td class="px-3 py-2">Lv.1</td><td class="px-3 py-2 text-right">2</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">1</td></tr>
                                    <tr><td class="px-3 py-2">Lv.2</td><td class="px-3 py-2 text-right">4</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">2</td></tr>
                                    <tr><td class="px-3 py-2">Lv.3</td><td class="px-3 py-2 text-right">6</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">5</td></tr>
                                    <tr><td class="px-3 py-2">Lv.4</td><td class="px-3 py-2 text-right">8</td><td class="px-3 py-2 text-right">85</td><td class="px-3 py-2 text-right">25</td><td class="px-3 py-2 text-right">15</td></tr>
                                    <tr><td class="px-3 py-2">Lv.5</td><td class="px-3 py-2 text-right">10</td><td class="px-3 py-2 text-right">277</td><td class="px-3 py-2 text-right">95</td><td class="px-3 py-2 text-right">45</td></tr>
                                    <tr><td class="px-3 py-2">Lv.6</td><td class="px-3 py-2 text-right">12</td><td class="px-3 py-2 text-right">1,045</td><td class="px-3 py-2 text-right">385</td><td class="px-3 py-2 text-right">134</td></tr>
                                    <tr><td class="px-3 py-2">Lv.7</td><td class="px-3 py-2 text-right">14</td><td class="px-3 py-2 text-right">4,117</td><td class="px-3 py-2 text-right">1,535</td><td class="px-3 py-2 text-right">401</td></tr>
                                    <tr><td class="px-3 py-2">Lv.8</td><td class="px-3 py-2 text-right">16</td><td class="px-3 py-2 text-right">16,405</td><td class="px-3 py-2 text-right">6,555</td><td class="px-3 py-2 text-right">X</td></tr>
                                    <tr class="bg-emerald-50 font-bold">
                                        <td class="px-3 py-2">합계</td>
                                        <td class="px-3 py-2 text-right">72</td>
                                        <td class="px-3 py-2 text-right">21,929</td>
                                        <td class="px-3 py-2 text-right">8,595</td>
                                        <td class="px-3 py-2 text-right">603</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Farm 4 Content -->
            <div id="farm-4" class="tab-content p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">입장 인원</label>
                        <input type="number" id="users-4" class="w-full px-4 py-2 border rounded-lg" value="100" min="1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">화분 개수</label>
                        <select id="pots-4" class="w-full px-4 py-2 border rounded-lg">
                            <option value="1">1개</option>
                            <option value="2">2개</option>
                            <option value="3" selected>3개</option>
                            <option value="4">4개</option>
                            <option value="5">5개</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">별 가격 ($)</label>
                        <select id="price-4" class="w-full px-4 py-2 border rounded-lg">
                            <option value="1">$1</option>
                            <option value="2" selected>$2</option>
                            <option value="3">$3</option>
                            <option value="4">$4</option>
                            <option value="5">$5</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="calculate(4)" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            계산하기
                        </button>
                    </div>
                </div>
                
                <div id="loading-4" class="hidden text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                </div>
                
                <div id="result-4" class="hidden">
                    <!-- Platform Revenue -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-4 border-2 border-green-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">💰 플랫폼 수익</h3>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">별 판매</div>
                                <div class="text-lg font-bold text-blue-600" id="platform-stars-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">별 수익</div>
                                <div class="text-lg font-bold text-green-600" id="platform-revenue-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">코인 지출</div>
                                <div class="text-lg font-bold text-red-600" id="platform-cost-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">순수익</div>
                                <div class="text-lg font-bold text-purple-600" id="platform-net-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">수익률</div>
                                <div class="text-lg font-bold" id="platform-margin-4">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- User 1 Revenue -->
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-4 border-2 border-amber-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">👤 1번 사용자 수익</h3>
                        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">화분 수</div>
                                <div class="text-lg font-bold text-indigo-600" id="user-pots-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">최고 레벨</div>
                                <div class="text-lg font-bold text-purple-600" id="user-level-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">구매 별</div>
                                <div class="text-lg font-bold text-blue-600" id="user-stars-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">투자금</div>
                                <div class="text-lg font-bold text-red-600" id="user-investment-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">수익금</div>
                                <div class="text-lg font-bold text-green-600" id="user-return-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">ROI</div>
                                <div class="text-lg font-bold" id="user-roi-4">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reward Plan Farm 4 -->
                    <div class="bg-white rounded-lg p-6 border-2 border-purple-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">🌲 농장 4 보상 플랜</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-purple-100">
                                    <tr>
                                        <th class="px-3 py-2 text-left">레벨</th>
                                        <th class="px-3 py-2 text-right">필요 별</th>
                                        <th class="px-3 py-2 text-right">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-right">보상 코인</th>
                                        <th class="px-3 py-2 text-right">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y">
                                    <tr><td class="px-3 py-2">Lv.1</td><td class="px-3 py-2 text-right">3</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">1</td></tr>
                                    <tr><td class="px-3 py-2">Lv.2</td><td class="px-3 py-2 text-right">6</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">1</td></tr>
                                    <tr><td class="px-3 py-2">Lv.3</td><td class="px-3 py-2 text-right">9</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">0</td><td class="px-3 py-2 text-right">2</td></tr>
                                    <tr><td class="px-3 py-2">Lv.4</td><td class="px-3 py-2 text-right">12</td><td class="px-3 py-2 text-right">156</td><td class="px-3 py-2 text-right">45</td><td class="px-3 py-2 text-right">4</td></tr>
                                    <tr><td class="px-3 py-2">Lv.5</td><td class="px-3 py-2 text-right">15</td><td class="px-3 py-2 text-right">656</td><td class="px-3 py-2 text-right">235</td><td class="px-3 py-2 text-right">9</td></tr>
                                    <tr><td class="px-3 py-2">Lv.6</td><td class="px-3 py-2 text-right">18</td><td class="px-3 py-2 text-right">3,156</td><td class="px-3 py-2 text-right">1,170</td><td class="px-3 py-2 text-right">18</td></tr>
                                    <tr><td class="px-3 py-2">Lv.7</td><td class="px-3 py-2 text-right">21</td><td class="px-3 py-2 text-right">15,656</td><td class="px-3 py-2 text-right">5,860</td><td class="px-3 py-2 text-right">35</td></tr>
                                    <tr><td class="px-3 py-2">Lv.8</td><td class="px-3 py-2 text-right">24</td><td class="px-3 py-2 text-right">78,156</td><td class="px-3 py-2 text-right">31,250</td><td class="px-3 py-2 text-right">X</td></tr>
                                    <tr class="bg-purple-50 font-bold">
                                        <td class="px-3 py-2">합계</td>
                                        <td class="px-3 py-2 text-right">108</td>
                                        <td class="px-3 py-2 text-right">97,780</td>
                                        <td class="px-3 py-2 text-right">38,560</td>
                                        <td class="px-3 py-2 text-right">70</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p class="text-sm text-blue-800">
                <strong>💡 핵심 변경사항:</strong><br>
                • 하트허용치 = 같은 농장 내 후발 입장자가 만드는 화분 개수 합계<br>
                • 농장 1 신규 입장 시 → 농장 1의 선발 사용자에게만 하트허용치 증가<br>
                • 각 농장은 완전히 독립적으로 운영 (농장 간 영향 없음)
            </p>
        </div>
    </div>

    <script>
        function switchTab(farmId) {
            // Hide all tabs
            for (let i = 1; i <= 4; i++) {
                document.getElementById(\`farm-\${i}\`).classList.remove('active');
                document.querySelectorAll('.tab-button')[i-1].classList.remove('active');
                document.querySelectorAll('.tab-button')[i-1].classList.add('inactive');
            }
            
            // Show selected tab
            document.getElementById(\`farm-\${farmId}\`).classList.add('active');
            document.querySelectorAll('.tab-button')[farmId-1].classList.add('active');
            document.querySelectorAll('.tab-button')[farmId-1].classList.remove('inactive');
        }

        async function calculate(farmId) {
            const users = document.getElementById(\`users-\${farmId}\`).value;
            const pots = document.getElementById(\`pots-\${farmId}\`).value;
            const price = document.getElementById(\`price-\${farmId}\`).value;
            
            if (!users || users < 1) {
                alert('유효한 인원수를 입력하세요');
                return;
            }
            
            const loading = document.getElementById(\`loading-\${farmId}\`);
            const result = document.getElementById(\`result-\${farmId}\`);
            
            loading.classList.remove('hidden');
            result.classList.add('hidden');
            
            try {
                const response = await fetch(\`/api/farm/\${farmId}/\${users}/\${pots}?starPrice=\${price}\`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || '계산 실패');
                }
                
                // Platform data
                document.getElementById(\`platform-stars-\${farmId}\`).textContent = data.platform.total_stars_sold.toLocaleString() + '개';
                document.getElementById(\`platform-revenue-\${farmId}\`).textContent = '$' + data.platform.star_revenue_usd.toLocaleString();
                document.getElementById(\`platform-cost-\${farmId}\`).textContent = '$' + data.platform.coin_cost_usd.toLocaleString();
                document.getElementById(\`platform-net-\${farmId}\`).textContent = '$' + data.platform.net_revenue_usd.toLocaleString();
                
                const margin = parseFloat(data.platform.profit_margin_percent);
                const marginEl = document.getElementById(\`platform-margin-\${farmId}\`);
                marginEl.textContent = data.platform.profit_margin_percent + '%';
                marginEl.className = 'text-lg font-bold ' + (margin >= 0 ? 'text-green-600' : 'text-red-600');
                
                // User 1 data
                if (data.user_1) {
                    document.getElementById(\`user-pots-\${farmId}\`).textContent = data.user_1.pots_count + '개';
                    document.getElementById(\`user-level-\${farmId}\`).textContent = 'Lv.' + data.user_1.highest_level;
                    document.getElementById(\`user-stars-\${farmId}\`).textContent = data.user_1.stars_purchased + '개';
                    document.getElementById(\`user-investment-\${farmId}\`).textContent = '$' + data.user_1.investment_usd.toLocaleString();
                    document.getElementById(\`user-return-\${farmId}\`).textContent = '$' + data.user_1.return_usd.toLocaleString();
                    
                    const roi = parseFloat(data.user_1.roi_percent);
                    const roiEl = document.getElementById(\`user-roi-\${farmId}\`);
                    roiEl.textContent = data.user_1.roi_percent + '%';
                    roiEl.className = 'text-lg font-bold ' + (roi >= 0 ? 'text-green-600' : 'text-red-600');
                }
                
                result.classList.remove('hidden');
            } catch (error) {
                alert('오류: ' + error.message);
            } finally {
                loading.classList.add('hidden');
            }
        }
    </script>
</body>
</html>`;
