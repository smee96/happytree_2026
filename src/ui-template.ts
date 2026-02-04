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
                <!-- Basic Settings -->
                <div class="bg-white rounded-lg p-4 mb-6 border-2 border-green-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">⚙️ 기본 설정</h3>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">입장 인원</label>
                            <input type="number" id="users-1" class="w-full px-4 py-2 border rounded-lg" value="100" min="1">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">화분 개수</label>
                            <input type="number" id="pots-1" class="w-full px-4 py-2 border rounded-lg" value="3" min="1" max="10">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">별 가격 ($)</label>
                            <input type="number" id="price-1" class="w-full px-4 py-2 border rounded-lg" value="2" min="0.1" step="0.1">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">초기 하트</label>
                            <input type="number" id="initial-hearts-1" class="w-full px-4 py-2 border rounded-lg" value="300000" min="0">
                        </div>
                        <div class="flex items-end">
                            <button onclick="calculate(1)" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                                계산하기
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Level Configuration -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800">📊 레벨별 조건 및 보상 설정</h3>
                        <button onclick="toggleLevelConfig(1)" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                            <span id="toggle-text-1">펼치기 ▼</span>
                        </button>
                    </div>
                    <div id="level-config-1" class="hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm bg-white rounded-lg">
                                <thead class="bg-blue-100">
                                    <tr>
                                        <th class="px-3 py-2 text-center">레벨</th>
                                        <th class="px-3 py-2 text-center">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-center">필요 별</th>
                                        <th class="px-3 py-2 text-center">보상 코인</th>
                                        <th class="px-3 py-2 text-center">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody id="level-config-body-1">
                                    <tr><td class="px-2 py-2 text-center font-semibold">Lv.1</td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="1" data-field="hearts_required"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="1" data-field="stars"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="1" data-field="coins"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="1" min="0" data-level="1" data-field="hearts_reward"></td>
                                    </tr>
                                    <tr><td class="px-2 py-2 text-center font-semibold">Lv.2</td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="2" data-field="hearts_required"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="2" data-field="stars"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="2" data-field="coins"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="3" min="0" data-level="2" data-field="hearts_reward"></td>
                                    </tr>
                                    <tr><td class="px-2 py-2 text-center font-semibold">Lv.3</td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="3" data-field="hearts_required"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="1" min="0" data-level="3" data-field="stars"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="3" data-field="coins"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="14" min="0" data-level="3" data-field="hearts_reward"></td>
                                    </tr>
                                    <tr class="bg-yellow-50"><td class="px-2 py-2 text-center font-semibold">Lv.4</td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="15" min="0" data-level="4" data-field="hearts_required"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="1" min="0" data-level="4" data-field="stars"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="6" min="0" data-level="4" data-field="coins"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="69" min="0" data-level="4" data-field="hearts_reward"></td>
                                    </tr>
                                    <tr class="bg-yellow-50"><td class="px-2 py-2 text-center font-semibold">Lv.5</td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="23" min="0" data-level="5" data-field="hearts_required"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="1" min="0" data-level="5" data-field="stars"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="12" min="0" data-level="5" data-field="coins"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="344" min="0" data-level="5" data-field="hearts_reward"></td>
                                    </tr>
                                    <tr class="bg-yellow-50"><td class="px-2 py-2 text-center font-semibold">Lv.6</td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="39" min="0" data-level="6" data-field="hearts_required"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="1" min="0" data-level="6" data-field="stars"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="24" min="0" data-level="6" data-field="coins"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="1719" min="0" data-level="6" data-field="hearts_reward"></td>
                                    </tr>
                                    <tr class="bg-yellow-50"><td class="px-2 py-2 text-center font-semibold">Lv.7</td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="71" min="0" data-level="7" data-field="hearts_required"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="1" min="0" data-level="7" data-field="stars"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="48" min="0" data-level="7" data-field="coins"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="8594" min="0" data-level="7" data-field="hearts_reward"></td>
                                    </tr>
                                    <tr class="bg-yellow-50"><td class="px-2 py-2 text-center font-semibold">Lv.8</td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="135" min="0" data-level="8" data-field="hearts_required"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="1" min="0" data-level="8" data-field="stars"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="96" min="0" data-level="8" data-field="coins"></td>
                                        <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="0" min="0" data-level="8" data-field="hearts_reward"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p class="text-xs text-gray-600 mt-2">💡 값을 수정한 후 "계산하기" 버튼을 눌러주세요.</p>
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
                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">화분 수</div>
                                <div class="text-lg font-bold text-indigo-600" id="user-pots-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">최고 레벨</div>
                                <div class="text-lg font-bold text-purple-600" id="user-level-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">보유 별</div>
                                <div class="text-lg font-bold text-blue-600" id="user-stars-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">보유 하트</div>
                                <div class="text-lg font-bold text-pink-600" id="user-hearts-1">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">하트허용치</div>
                                <div class="text-lg font-bold text-orange-600" id="user-allowance-1">-</div>
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
                    
                    <!-- Level Stats Farm 1 -->
                    <div class="bg-white rounded-lg p-6 border-2 border-green-200 mb-4">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">📊 농장 1 레벨별 달성 현황</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-green-100">
                                    <tr>
                                        <th class="px-3 py-2 text-left">레벨</th>
                                        <th class="px-3 py-2 text-right">달성자 수</th>
                                        <th class="px-3 py-2 text-right">도달 화분 수</th>
                                        <th class="px-3 py-2 text-right">필요 별</th>
                                        <th class="px-3 py-2 text-right">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-right">보상 코인</th>
                                        <th class="px-3 py-2 text-right">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y" id="level-stats-1">
                                    <tr><td colspan="7" class="px-3 py-4 text-center text-gray-500">계산하기를 눌러주세요</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Farm 2 Content -->
            <div id="farm-2" class="tab-content p-6">
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">입장 인원</label>
                        <input type="number" id="users-2" class="w-full px-4 py-2 border rounded-lg" value="100" min="1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">화분 개수</label>
                        <input type="number" id="pots-2" class="w-full px-4 py-2 border rounded-lg" value="3" min="1" max="10">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">별 가격 ($)</label>
                        <input type="number" id="price-2" class="w-full px-4 py-2 border rounded-lg" value="2" min="0.1" step="0.1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">초기 하트</label>
                        <input type="number" id="initialHearts-2" class="w-full px-4 py-2 border rounded-lg" value="300000" min="0">
                    </div>
                    <div class="flex items-end">
                        <button onclick="calculate(2)" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            계산하기
                        </button>
                    </div>
                </div>
                
                <!-- Level Configuration Farm 2 -->
                <div class="mb-6">
                    <button onclick="toggleLevelConfig(2)" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        레벨별 조건 및 보상 설정
                    </button>
                    <div id="level-config-2" class="hidden mt-4 bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-bold mb-4">레벨별 설정 (Farm 2)</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="bg-gray-200">
                                        <th class="p-2">레벨</th>
                                        <th class="p-2">필요 하트허용치</th>
                                        <th class="p-2">필요 별</th>
                                        <th class="p-2">보상 코인</th>
                                        <th class="p-2">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody id="level-inputs-2">
                                    ${Array.from({ length: 8 }, (_, i) => {
                                        const level = i + 1;
                                        const defaults = {hearts_required: 0, stars: 0, coins: 0, hearts_reward: 1};
                                        return `
                                        <tr data-level="${level}">
                                            <td class="p-2 text-center font-bold">${level}</td>
                                            <td class="p-2"><input type="number" data-field="hearts_required" class="w-full px-2 py-1 border rounded" value="${defaults.hearts_required}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="stars" class="w-full px-2 py-1 border rounded" value="${defaults.stars}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="coins" class="w-full px-2 py-1 border rounded" value="${defaults.coins}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="hearts_reward" class="w-full px-2 py-1 border rounded" value="${defaults.hearts_reward}" min="0"></td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
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
                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">화분 수</div>
                                <div class="text-lg font-bold text-indigo-600" id="user-pots-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">최고 레벨</div>
                                <div class="text-lg font-bold text-purple-600" id="user-level-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">보유 별</div>
                                <div class="text-lg font-bold text-blue-600" id="user-stars-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">보유 하트</div>
                                <div class="text-lg font-bold text-pink-600" id="user-hearts-2">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">하트허용치</div>
                                <div class="text-lg font-bold text-orange-600" id="user-allowance-2">-</div>
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
                    
                    <!-- Level Stats Farm 2 -->
                    <div class="bg-white rounded-lg p-6 border-2 border-blue-200 mb-4">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">📊 농장 2 레벨별 달성 현황</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-blue-100">
                                    <tr>
                                        <th class="px-3 py-2 text-left">레벨</th>
                                        <th class="px-3 py-2 text-right">달성자 수</th>
                                        <th class="px-3 py-2 text-right">도달 화분 수</th>
                                        <th class="px-3 py-2 text-right">필요 별</th>
                                        <th class="px-3 py-2 text-right">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-right">보상 코인</th>
                                        <th class="px-3 py-2 text-right">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y" id="level-stats-2">
                                    <tr><td colspan="7" class="px-3 py-4 text-center text-gray-500">계산하기를 눌러주세요</td></tr>
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
                        <input type="number" id="pots-3" class="w-full px-4 py-2 border rounded-lg" value="3" min="1" max="10">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">별 가격 ($)</label>
                        <input type="number" id="price-3" class="w-full px-4 py-2 border rounded-lg" value="2" min="0.1" step="0.1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">초기 하트</label>
                        <input type="number" id="initialHearts-3" class="w-full px-4 py-2 border rounded-lg" value="300000" min="0">
                    </div>
                    <div class="flex items-end">
                        <button onclick="calculate(3)" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            계산하기
                        </button>
                    </div>
                </div>
                
                <!-- Level Configuration Farm 3 -->
                <div class="mb-6">
                    <button onclick="toggleLevelConfig(3)" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        레벨별 조건 및 보상 설정
                    </button>
                    <div id="level-config-3" class="hidden mt-4 bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-bold mb-4">레벨별 설정 (Farm 3)</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="bg-gray-200">
                                        <th class="p-2">레벨</th>
                                        <th class="p-2">필요 하트허용치</th>
                                        <th class="p-2">필요 별</th>
                                        <th class="p-2">보상 코인</th>
                                        <th class="p-2">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody id="level-inputs-3">
                                    ${Array.from({ length: 8 }, (_, i) => {
                                        const level = i + 1;
                                        const defaults = {hearts_required: 0, stars: 0, coins: 0, hearts_reward: 1};
                                        return `
                                        <tr data-level="${level}">
                                            <td class="p-2 text-center font-bold">${level}</td>
                                            <td class="p-2"><input type="number" data-field="hearts_required" class="w-full px-2 py-1 border rounded" value="${defaults.hearts_required}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="stars" class="w-full px-2 py-1 border rounded" value="${defaults.stars}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="coins" class="w-full px-2 py-1 border rounded" value="${defaults.coins}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="hearts_reward" class="w-full px-2 py-1 border rounded" value="${defaults.hearts_reward}" min="0"></td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
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
                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">화분 수</div>
                                <div class="text-lg font-bold text-indigo-600" id="user-pots-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">최고 레벨</div>
                                <div class="text-lg font-bold text-purple-600" id="user-level-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">보유 별</div>
                                <div class="text-lg font-bold text-blue-600" id="user-stars-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">보유 하트</div>
                                <div class="text-lg font-bold text-pink-600" id="user-hearts-3">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">하트허용치</div>
                                <div class="text-lg font-bold text-orange-600" id="user-allowance-3">-</div>
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
                    
                    <!-- Level Stats Farm 3 -->
                    <div class="bg-white rounded-lg p-6 border-2 border-emerald-200 mb-4">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">📊 농장 3 레벨별 달성 현황</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-emerald-100">
                                    <tr>
                                        <th class="px-3 py-2 text-left">레벨</th>
                                        <th class="px-3 py-2 text-right">달성자 수</th>
                                        <th class="px-3 py-2 text-right">도달 화분 수</th>
                                        <th class="px-3 py-2 text-right">필요 별</th>
                                        <th class="px-3 py-2 text-right">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-right">보상 코인</th>
                                        <th class="px-3 py-2 text-right">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y" id="level-stats-3">
                                    <tr><td colspan="7" class="px-3 py-4 text-center text-gray-500">계산하기를 눌러주세요</td></tr>
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
                        <input type="number" id="pots-4" class="w-full px-4 py-2 border rounded-lg" value="3" min="1" max="10">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">별 가격 ($)</label>
                        <input type="number" id="price-4" class="w-full px-4 py-2 border rounded-lg" value="2" min="0.1" step="0.1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">초기 하트</label>
                        <input type="number" id="initialHearts-4" class="w-full px-4 py-2 border rounded-lg" value="300000" min="0">
                    </div>
                    <div class="flex items-end">
                        <button onclick="calculate(4)" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            계산하기
                        </button>
                    </div>
                </div>
                
                <!-- Level Configuration Farm 4 -->
                <div class="mb-6">
                    <button onclick="toggleLevelConfig(4)" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        레벨별 조건 및 보상 설정
                    </button>
                    <div id="level-config-4" class="hidden mt-4 bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-bold mb-4">레벨별 설정 (Farm 4)</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="bg-gray-200">
                                        <th class="p-2">레벨</th>
                                        <th class="p-2">필요 하트허용치</th>
                                        <th class="p-2">필요 별</th>
                                        <th class="p-2">보상 코인</th>
                                        <th class="p-2">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody id="level-inputs-4">
                                    ${Array.from({ length: 8 }, (_, i) => {
                                        const level = i + 1;
                                        const defaults = {hearts_required: 0, stars: 0, coins: 0, hearts_reward: 1};
                                        return `
                                        <tr data-level="${level}">
                                            <td class="p-2 text-center font-bold">${level}</td>
                                            <td class="p-2"><input type="number" data-field="hearts_required" class="w-full px-2 py-1 border rounded" value="${defaults.hearts_required}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="stars" class="w-full px-2 py-1 border rounded" value="${defaults.stars}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="coins" class="w-full px-2 py-1 border rounded" value="${defaults.coins}" min="0"></td>
                                            <td class="p-2"><input type="number" data-field="hearts_reward" class="w-full px-2 py-1 border rounded" value="${defaults.hearts_reward}" min="0"></td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
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
                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">화분 수</div>
                                <div class="text-lg font-bold text-indigo-600" id="user-pots-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">최고 레벨</div>
                                <div class="text-lg font-bold text-purple-600" id="user-level-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">보유 별</div>
                                <div class="text-lg font-bold text-blue-600" id="user-stars-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">보유 하트</div>
                                <div class="text-lg font-bold text-pink-600" id="user-hearts-4">-</div>
                            </div>
                            <div class="bg-white p-3 rounded-lg">
                                <div class="text-xs text-gray-600">하트허용치</div>
                                <div class="text-lg font-bold text-orange-600" id="user-allowance-4">-</div>
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
                    
                    <!-- Level Stats Farm 4 -->
                    <div class="bg-white rounded-lg p-6 border-2 border-purple-200 mb-4">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">📊 농장 4 레벨별 달성 현황</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-purple-100">
                                    <tr>
                                        <th class="px-3 py-2 text-left">레벨</th>
                                        <th class="px-3 py-2 text-right">달성자 수</th>
                                        <th class="px-3 py-2 text-right">도달 화분 수</th>
                                        <th class="px-3 py-2 text-right">필요 별</th>
                                        <th class="px-3 py-2 text-right">필요 하트허용치</th>
                                        <th class="px-3 py-2 text-right">보상 코인</th>
                                        <th class="px-3 py-2 text-right">보상 하트</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y" id="level-stats-4">
                                    <tr><td colspan="7" class="px-3 py-4 text-center text-gray-500">계산하기를 눌러주세요</td></tr>
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
        function toggleLevelConfig(farmId) {
            const configDiv = document.getElementById(\`level-config-\${farmId}\`);
            const toggleText = document.getElementById(\`toggle-text-\${farmId}\`);
            
            if (configDiv.classList.contains('hidden')) {
                configDiv.classList.remove('hidden');
                toggleText.textContent = '접기 ▲';
            } else {
                configDiv.classList.add('hidden');
                toggleText.textContent = '펼치기 ▼';
            }
        }
        
        function saveAllSettings(farmId) {
            // 기본 설정 저장
            const settings = {
                users: document.getElementById(\`users-\${farmId}\`)?.value || '100',
                pots: document.getElementById(\`pots-\${farmId}\`)?.value || '3',
                price: document.getElementById(\`price-\${farmId}\`)?.value || '2',
                initialHearts: document.getElementById(\`initialHearts-\${farmId}\`)?.value || '300000'
            };
            
            // 레벨 설정 저장
            const levels = getLevelConfig(farmId);
            
            // 전체 저장
            const allData = { settings, levels };
            localStorage.setItem(\`farm\${farmId}_config\`, JSON.stringify(allData));
            console.log(\`Farm \${farmId} all settings saved\`, allData);
        }
        
        function loadAllSettings(farmId) {
            const saved = localStorage.getItem(\`farm\${farmId}_config\`);
            if (saved) {
                try {
                    const allData = JSON.parse(saved);
                    
                    // 기본 설정 복원
                    if (allData.settings) {
                        const usersInput = document.getElementById(\`users-\${farmId}\`);
                        const potsInput = document.getElementById(\`pots-\${farmId}\`);
                        const priceInput = document.getElementById(\`price-\${farmId}\`);
                        const heartsInput = document.getElementById(\`initialHearts-\${farmId}\`);
                        
                        if (usersInput) usersInput.value = allData.settings.users;
                        if (potsInput) potsInput.value = allData.settings.pots;
                        if (priceInput) priceInput.value = allData.settings.price;
                        if (heartsInput) heartsInput.value = allData.settings.initialHearts;
                    }
                    
                    // 레벨 설정 복원
                    if (allData.levels && allData.levels.length > 0) {
                        allData.levels.forEach((level, idx) => {
                            const row = document.querySelector(\`#level-inputs-\${farmId} tr[data-level="\${idx + 1}"]\`);
                            if (row) {
                                const inputs = row.querySelectorAll('input[data-field]');
                                inputs.forEach(input => {
                                    const field = input.getAttribute('data-field');
                                    if (level[field] !== undefined) {
                                        input.value = level[field];
                                    }
                                });
                            }
                        });
                    }
                    
                    console.log(\`Farm \${farmId} all settings loaded\`, allData);
                } catch (e) {
                    console.error('Failed to load settings:', e);
                }
            }
        }
        
        function getLevelConfig(farmId) {
            const levels = [];
            for (let i = 1; i <= 8; i++) {
                const row = document.querySelector(\`#level-inputs-\${farmId} tr[data-level="\${i}"]\`);
                const levelData = { level: i };
                
                if (row) {
                    const inputs = row.querySelectorAll('input[data-field]');
                    inputs.forEach(input => {
                        const field = input.getAttribute('data-field');
                        levelData[field] = parseFloat(input.value) || 0;
                    });
                }
                
                levels.push(levelData);
            }
            
            return levels;
        }
        
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
            const initialHearts = document.getElementById(\`initialHearts-\${farmId}\`)?.value || '300000';
            const levels = getLevelConfig(farmId);
            
            if (!users || users < 1) {
                alert('유효한 인원수를 입력하세요');
                return;
            }
            
            // 모든 설정 저장
            saveAllSettings(farmId);
            
            const loading = document.getElementById(\`loading-\${farmId}\`);
            const result = document.getElementById(\`result-\${farmId}\`);
            
            loading.classList.remove('hidden');
            result.classList.add('hidden');
            
            try {
                const response = await fetch(\`/api/farm/\${farmId}/\${users}/\${pots}?starPrice=\${price}&initialHearts=\${initialHearts}\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ levels })
                });
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || '계산 실패');
                }
                
                // Platform data
                if (data.platform) {
                    document.getElementById(\`platform-stars-\${farmId}\`).textContent = (data.platform.total_stars_sold || 0).toLocaleString() + '개';
                    document.getElementById(\`platform-revenue-\${farmId}\`).textContent = '$' + (data.platform.star_revenue_usd || 0).toLocaleString();
                    document.getElementById(\`platform-cost-\${farmId}\`).textContent = '$' + (data.platform.coin_cost_usd || 0).toLocaleString();
                    document.getElementById(\`platform-net-\${farmId}\`).textContent = '$' + (data.platform.net_revenue_usd || 0).toLocaleString();
                    
                    const margin = parseFloat(data.platform.profit_margin_percent || '0');
                    const marginEl = document.getElementById(\`platform-margin-\${farmId}\`);
                    marginEl.textContent = (data.platform.profit_margin_percent || '0') + '%';
                    marginEl.className = 'text-lg font-bold ' + (margin >= 0 ? 'text-green-600' : 'text-red-600');
                }
                
                // User 1 data
                if (data.user_1) {
                    document.getElementById(\`user-pots-\${farmId}\`).textContent = (data.user_1.pots_count || 0) + '개';
                    document.getElementById(\`user-level-\${farmId}\`).textContent = 'Lv.' + (data.user_1.highest_level || 0);
                    document.getElementById(\`user-stars-\${farmId}\`).textContent = (data.user_1.stars_purchased || 0) + '개';
                    document.getElementById(\`user-hearts-\${farmId}\`).textContent = (data.user_1.hearts_balance || 0).toLocaleString() + '개';
                    document.getElementById(\`user-allowance-\${farmId}\`).textContent = (data.user_1.heart_allowance || 0).toLocaleString();
                    document.getElementById(\`user-investment-\${farmId}\`).textContent = '$' + (data.user_1.investment_usd || 0).toLocaleString();
                    document.getElementById(\`user-return-\${farmId}\`).textContent = '$' + (data.user_1.return_usd || 0).toLocaleString();
                    
                    const roi = parseFloat(data.user_1.roi_percent || '0');
                    const roiEl = document.getElementById(\`user-roi-\${farmId}\`);
                    roiEl.textContent = (data.user_1.roi_percent || '0') + '%';
                    roiEl.className = 'text-lg font-bold ' + (roi >= 0 ? 'text-green-600' : 'text-red-600');
                }
                
                // Level stats data
                if (data.level_stats) {
                    const tbody = document.getElementById(\`level-stats-\${farmId}\`);
                    tbody.innerHTML = '';
                    
                    data.level_stats.forEach(stat => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td class="px-3 py-2">Lv.\${stat.level || 0}</td>
                            <td class="px-3 py-2 text-right font-semibold text-blue-600">\${(stat.achievers_count || 0).toLocaleString()}명</td>
                            <td class="px-3 py-2 text-right font-semibold text-green-600">\${(stat.pots_count || 0).toLocaleString()}개</td>
                            <td class="px-3 py-2 text-right">\${stat.stars_per_person || 0}</td>
                            <td class="px-3 py-2 text-right">\${(stat.hearts_required || 0).toLocaleString()}</td>
                            <td class="px-3 py-2 text-right">\${stat.coins_per_person || 0}</td>
                            <td class="px-3 py-2 text-right">\${(stat.hearts_reward || 0) > 0 ? (stat.hearts_reward || 0).toLocaleString() : 'X'}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                }
                
                result.classList.remove('hidden');
            } catch (error) {
                alert('오류: ' + error.message);
            } finally {
                loading.classList.add('hidden');
            }
        }
        
        // Load saved settings for all farms when page loads
        window.addEventListener('DOMContentLoaded', function() {
            // Load settings for all 4 farms
            for (let i = 1; i <= 4; i++) {
                loadAllSettings(i);
            }
            console.log('All farm settings loaded from localStorage');
        });
    </script>
</body>
</html>`;
