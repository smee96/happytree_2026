export const gamePageTemplate = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HappyTree - 화분 키우기</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes grow {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes levelUp {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-30px) scale(1.2); }
            100% { transform: translateY(0px) scale(1); }
        }
        @keyframes beanstalkGrow {
            0% { 
                height: 0%; 
                opacity: 0; 
                transform: scaleY(0);
                transform-origin: bottom;
            }
            50% {
                opacity: 1;
            }
            100% { 
                height: 100%; 
                opacity: 0.2; 
                transform: scaleY(1);
                transform-origin: bottom;
            }
        }
        @keyframes leafFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(5deg); }
            75% { transform: translateY(-5px) rotate(-5deg); }
        }
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1.5); }
        }
        .pot-card {
            transition: all 0.3s ease;
        }
        .pot-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .level-up-animation {
            animation: levelUp 0.6s ease-in-out;
        }
        .grow-animation {
            animation: grow 0.5s ease-out;
        }
        .beanstalk-animation {
            animation: beanstalkGrow 2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .leaf-float {
            animation: leafFloat 2s ease-in-out infinite;
        }
        .sparkle {
            animation: sparkle 1.5s ease-in-out;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen p-4">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800">🌳 HappyTree - 화분 키우기</h1>
                    <p class="text-gray-600 mt-1">당신의 화분을 성장시키세요!</p>
                </div>
                <a href="/" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition">
                    ← 메인으로
                </a>
            </div>
        </div>

        <!-- Farm Selection -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">🌱 농장 선택</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onclick="selectFarm(1)" id="farm-btn-1" class="farm-btn px-6 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition">
                    농장 1
                </button>
                <button onclick="selectFarm(2)" id="farm-btn-2" class="farm-btn px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">
                    농장 2
                </button>
                <button onclick="selectFarm(3)" id="farm-btn-3" class="farm-btn px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">
                    농장 3
                </button>
                <button onclick="selectFarm(4)" id="farm-btn-4" class="farm-btn px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">
                    농장 4
                </button>
            </div>
        </div>

        <!-- User Stats -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">📊 내 상태</h2>
                <div class="flex gap-2">
                    <button onclick="resetFarm()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition">
                        🔄 농장 초기화
                    </button>
                    <button onclick="toggleTestMode()" id="test-mode-btn" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold transition">
                        🧪 테스트 모드: OFF
                    </button>
                </div>
            </div>
            
            <!-- 테스트 모드 통계 -->
            <div id="test-mode-stats" class="hidden bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-4">
                <div class="text-center mb-2">
                    <span class="text-sm font-bold text-orange-600">🧪 테스트 모드 활성화 - 아래 데이터는 실제 차감/획득되지 않습니다</span>
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                        <div class="text-xs text-gray-600">테스트 별 구매</div>
                        <div class="text-lg font-bold text-yellow-600" id="test-stars">0개</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xs text-gray-600">테스트 코인 획득</div>
                        <div class="text-lg font-bold text-amber-600" id="test-coins">0개</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xs text-gray-600">테스트 허용치 사용</div>
                        <div class="text-lg font-bold text-pink-600" id="test-allowance">0개</div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div class="bg-purple-50 rounded-lg p-4 text-center cursor-pointer" onclick="showWalletModal()">
                    <div class="text-2xl mb-1">💰</div>
                    <div class="text-sm text-gray-600">충전 지갑</div>
                    <div class="text-2xl font-bold text-purple-600" id="wallet-balance">$0.00</div>
                    <div class="text-xs text-purple-500 mt-1">클릭하여 충전</div>
                </div>
                <div class="bg-red-50 rounded-lg p-4 text-center">
                    <div class="text-2xl mb-1">💚</div>
                    <div class="text-sm text-gray-600">하트 보유</div>
                    <div class="text-2xl font-bold text-gray-800" id="hearts-balance">300000</div>
                </div>
                <div class="bg-pink-50 rounded-lg p-4 text-center">
                    <div class="text-2xl mb-1">💗</div>
                    <div class="text-sm text-gray-600">하트 허용치</div>
                    <div class="text-2xl font-bold text-gray-800" id="hearts-allowance">1</div>
                </div>
                <div class="bg-yellow-50 rounded-lg p-4 text-center">
                    <div class="text-2xl mb-1">⭐</div>
                    <div class="text-sm text-gray-600">구매한 별</div>
                    <div class="text-2xl font-bold text-gray-800" id="stars-purchased">0</div>
                </div>
                <div class="bg-amber-50 rounded-lg p-4 text-center">
                    <div class="text-2xl mb-1">🪙</div>
                    <div class="text-sm text-gray-600">획득 코인</div>
                    <div class="text-2xl font-bold text-gray-800" id="coins-earned">0</div>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                    <div class="text-2xl mb-1">🌱</div>
                    <div class="text-sm text-gray-600">화분 개수</div>
                    <div class="text-2xl font-bold text-gray-800" id="pots-count">1</div>
                </div>
            </div>
        </div>

        <!-- Pots -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">🪴 내 화분들</h2>
                <button onclick="buyNewPot()" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition">
                    + 화분 구매
                </button>
            </div>
            <div id="pots-container" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <!-- Pots will be rendered here -->
            </div>
        </div>

        <!-- Warehouse -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">🏛️ 창고 (최대 레벨 달성 화분)</h2>
                <span class="text-sm text-gray-600">창고 화분 수: <span id="warehouse-count" class="font-bold">0</span>개</span>
            </div>
            <div id="warehouse-container" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <!-- Warehouse pots will be rendered here -->
            </div>
            <div id="warehouse-empty" class="text-center py-8 text-gray-500">
                아직 창고에 보관된 화분이 없습니다. 최대 레벨을 달성한 화분을 창고로 보내세요!
            </div>
        </div>

        <!-- Level Info -->
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">📋 레벨 정보 (농장 <span id="current-farm-display">1</span>)</h2>
                <button onclick="showLevelEditModal()" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition">
                    ⚙️ 레벨 설정 편집
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-2 text-center">레벨</th>
                            <th class="px-4 py-2 text-center">필요 하트허용치</th>
                            <th class="px-4 py-2 text-center">필요 별</th>
                            <th class="px-4 py-2 text-center">보상 코인</th>
                            <th class="px-4 py-2 text-center">보상 하트</th>
                        </tr>
                    </thead>
                    <tbody id="level-info-tbody">
                        <!-- Level info will be rendered here -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Level Edit Modal -->
    <div id="level-edit-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 my-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">⚙️ 레벨 설정 편집 (농장 <span id="edit-farm-display">1</span>)</h3>
            <p class="text-sm text-gray-600 mb-4">💡 설정하기(시뮬레이터)의 값을 사용합니다. 여기서 수정하면 게임하기에만 적용됩니다.</p>
            
            <div class="overflow-x-auto mb-4">
                <table class="w-full text-sm bg-white">
                    <thead class="bg-blue-100">
                        <tr>
                            <th class="px-3 py-2 text-center">레벨</th>
                            <th class="px-3 py-2 text-center">필요 하트허용치</th>
                            <th class="px-3 py-2 text-center">필요 별</th>
                            <th class="px-3 py-2 text-center">보상 코인</th>
                            <th class="px-3 py-2 text-center">보상 하트</th>
                        </tr>
                    </thead>
                    <tbody id="level-edit-tbody">
                        <!-- Level edit inputs will be rendered here -->
                    </tbody>
                </table>
            </div>
            
            <div class="flex gap-3">
                <button onclick="saveLevelEdit()" class="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition">
                    💾 저장하기
                </button>
                <button onclick="resetLevelToSimulator()" class="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition">
                    🔄 시뮬레이터 값으로 복원
                </button>
                <button onclick="closeLevelEditModal()" class="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-bold transition">
                    취소
                </button>
            </div>
        </div>
    </div>

    <!-- Wallet Modal -->
    <div id="wallet-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">💰 지갑 충전</h3>
            <p class="text-gray-600 mb-4">별을 구매하기 위한 캐시를 충전하세요</p>
            <div class="bg-purple-50 rounded-lg p-4 mb-4">
                <div class="text-sm text-gray-600 mb-1">현재 잔액</div>
                <div class="text-3xl font-bold text-purple-600">$<span id="wallet-balance-modal">0.00</span></div>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <button onclick="chargeWallet(10)" class="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition">
                    $10 충전
                </button>
                <button onclick="chargeWallet(50)" class="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition">
                    $50 충전
                </button>
                <button onclick="chargeWallet(100)" class="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition">
                    $100 충전
                </button>
                <button onclick="chargeWallet(500)" class="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-bold transition">
                    $500 충전
                </button>
            </div>
            <button onclick="closeWalletModal()" class="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition">
                닫기
            </button>
        </div>
    </div>

    <!-- Level Up Modal -->
    <div id="levelup-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden">
            <!-- 잭과 콩나무 애니메이션 배경 - 아래에서 위로 자라는 효과 -->
            <div class="absolute bottom-0 left-0 right-0 beanstalk-animation" style="background: linear-gradient(to top, #10b981 0%, #34d399 30%, #6ee7b7 60%, transparent 100%); height: 100%; opacity: 0.15;"></div>
            
            <!-- 반짝이는 별 효과 -->
            <div class="absolute top-4 left-4 text-2xl sparkle" style="animation-delay: 0s;">✨</div>
            <div class="absolute top-8 right-8 text-2xl sparkle" style="animation-delay: 0.3s;">⭐</div>
            <div class="absolute top-16 left-16 text-2xl sparkle" style="animation-delay: 0.6s;">💫</div>
            <div class="absolute top-4 right-4 text-2xl sparkle" style="animation-delay: 0.9s;">✨</div>
            
            <div class="relative z-10">
                <div class="text-6xl mb-4 level-up-animation leaf-float">🌱➡️🌳</div>
                <h3 class="text-3xl font-bold text-gray-800 mb-2">레벨 업!</h3>
                <p class="text-xl text-gray-600 mb-4">화분 <span id="modal-pot-num"></span>이(가) Lv.<span id="modal-level"></span>에 도달했습니다!</p>
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border-2 border-green-200">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div class="text-gray-600">🪙 코인 획득</div>
                            <div class="text-2xl font-bold text-amber-600">+<span id="modal-coins">0</span></div>
                        </div>
                        <div>
                            <div class="text-gray-600">💚 하트 획득</div>
                            <div class="text-2xl font-bold text-red-600">+<span id="modal-hearts">0</span></div>
                        </div>
                    </div>
                </div>
                <button onclick="closeModal()" class="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-bold transition shadow-lg">
                    확인
                </button>
            </div>
        </div>
    </div>

    <script>
        // Pot emoji by level
        const POT_EMOJIS = {
            0: '🏺',  // 빈 화분
            1: '🟤',  // 흙
            2: '🌱',  // 씨앗
            3: '🌿',  // 작은 싹
            4: '🪴',  // 화분 식물
            5: '🌳',  // 작은 나무
            6: '🌲',  // 중간 나무
            7: '🎋',  // 대나무
            8: '🌴'   // 큰 나무
        };

        // Game State
        let gameState = {
            currentFarm: 1,
            walletBalance: 0,
            heartsBalance: 300000,
            heartAllowance: 1,
            starsPurchased: 0,
            coinsEarned: 0,
            pots: [
                { id: 1, level: 0, farmId: 1 }  // farmId 추가
            ],
            warehouse: [],  // 창고에 보관된 화분들
            farmLevels: {},
            farmUnlocked: { 1: true, 2: false, 3: false, 4: false },  // 농장 잠금 상태
            starPrice: 2,  // 별 1개당 $2
            testMode: false,  // 🧪 테스트 모드 (조건 무시)
            testStats: {  // 테스트 모드 전용 통계
                stars: 0,
                coins: 0,
                allowance: 0
            }
        };

        // Load farm levels configuration
        // 게임하기는 다음 우선순위로 값을 사용합니다:
        // 1. 게임하기 전용 설정 (game_farmX_levels)
        // 2. 설정하기(시뮬레이터)의 현재값 (farmX_config)
        // 3. API 기본값
        async function loadFarmLevels() {
            try {
                // API에서 기본값 로드
                const response = await fetch('/api/farm-levels');
                const apiData = await response.json();
                
                // 각 농장별로 적용
                for (let farmId = 1; farmId <= 4; farmId++) {
                    // 1순위: 게임하기 전용 설정
                    const gameLevels = localStorage.getItem(\`game_farm\${farmId}_levels\`);
                    if (gameLevels) {
                        try {
                            gameState.farmLevels[farmId] = JSON.parse(gameLevels);
                            console.log(\`Farm \${farmId}: Using game-specific levels\`);
                            continue;
                        } catch (e) {
                            console.error(\`Failed to parse game_farm\${farmId}_levels:\`, e);
                        }
                    }
                    
                    // 2순위: 설정하기(시뮬레이터)의 현재값
                    const simulatorConfig = localStorage.getItem(\`farm\${farmId}_config\`);
                    if (simulatorConfig) {
                        try {
                            const config = JSON.parse(simulatorConfig);
                            if (config.levels && config.levels.length > 0) {
                                gameState.farmLevels[farmId] = config.levels;
                                console.log(\`Farm \${farmId}: Using simulator levels\`);
                                continue;
                            }
                        } catch (e) {
                            console.error(\`Failed to parse farm\${farmId}_config:\`, e);
                        }
                    }
                    
                    // 3순위: API 기본값
                    gameState.farmLevels[farmId] = apiData[farmId];
                    console.log(\`Farm \${farmId}: Using API default levels\`);
                }
                
                renderLevelInfo();
            } catch (error) {
                console.error('Failed to load farm levels:', error);
            }
        }

        // Initialize game
        async function initGame() {
            await loadFarmLevels();  // farmLevels 먼저 로드
            loadGameState();         // 그 다음 게임 상태 로드
            updateFarmButtons();     // 농장 버튼 상태 업데이트
            renderPots();
            renderWarehouse();       // 창고 렌더링
            updateStats();
        }

        // Save/Load game state
        function saveGameState() {
            localStorage.setItem('happytree_game', JSON.stringify(gameState));
        }

        function loadGameState() {
            const saved = localStorage.getItem('happytree_game');
            if (saved) {
                const savedState = JSON.parse(saved);
                // farmLevels는 덮어쓰지 않고 나머지만 복원
                gameState.currentFarm = savedState.currentFarm || 1;
                gameState.walletBalance = savedState.walletBalance || 0;
                gameState.heartsBalance = savedState.heartsBalance || 300000;
                gameState.heartAllowance = savedState.heartAllowance || 1;
                gameState.starsPurchased = savedState.starsPurchased || 0;
                gameState.coinsEarned = savedState.coinsEarned || 0;
                gameState.pots = savedState.pots || [{ id: 1, level: 0, farmId: 1 }];
                gameState.warehouse = savedState.warehouse || [];
                gameState.farmUnlocked = savedState.farmUnlocked || { 1: true, 2: false, 3: false, 4: false };
                gameState.starPrice = savedState.starPrice || 2;
                gameState.testMode = savedState.testMode || false;
                gameState.testStats = savedState.testStats || { stars: 0, coins: 0, allowance: 0 };
                
                // 기존 화분에 farmId가 없으면 currentFarm으로 설정
                gameState.pots = gameState.pots.map(pot => ({
                    ...pot,
                    farmId: pot.farmId || gameState.currentFarm
                }));
                
                // 창고 화분에도 farmId가 없으면 농장 1로 설정
                gameState.warehouse = gameState.warehouse.map(pot => ({
                    ...pot,
                    farmId: pot.farmId || 1
                }));
                
                // farmLevels는 loadFarmLevels()에서 이미 로드됨
                console.log('Game state loaded', gameState);
            }
        }

        // Select Farm
        function selectFarm(farmId) {
            // 잠긴 농장 체크
            if (!gameState.farmUnlocked[farmId]) {
                alert(\`🔒 농장 \${farmId}은(는) 잠겨있습니다!\\n\\n농장 \${farmId - 1}에서 최대 레벨(Lv.8)을 달성한 화분이 있어야 해제됩니다.\`);
                return;
            }
            
            gameState.currentFarm = farmId;
            
            // Update button styles
            updateFarmButtons();
            
            document.getElementById('current-farm-display').textContent = farmId;
            renderLevelInfo();
            renderPots();
            saveGameState();
        }
        
        // Update Farm Buttons with lock status
        function updateFarmButtons() {
            for (let i = 1; i <= 4; i++) {
                const btn = document.getElementById(\`farm-btn-\${i}\`);
                const isUnlocked = gameState.farmUnlocked[i];
                const isCurrent = i === gameState.currentFarm;
                
                if (!isUnlocked) {
                    // 잠긴 농장
                    btn.className = 'farm-btn px-6 py-4 bg-gray-400 text-gray-600 rounded-lg font-bold cursor-not-allowed opacity-50';
                    btn.innerHTML = \`🔒 농장 \${i}\`;
                } else if (isCurrent) {
                    // 현재 선택된 농장
                    btn.className = 'farm-btn px-6 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition';
                    btn.innerHTML = \`농장 \${i}\`;
                } else {
                    // 해제된 다른 농장
                    btn.className = 'farm-btn px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition';
                    btn.innerHTML = \`농장 \${i}\`;
                }
            }
        }
        
        // Check and unlock next farm
        function checkFarmUnlock() {
            // 각 농장에서 최대 레벨 달성 확인
            for (let farmId = 1; farmId <= 3; farmId++) {
                const hasMaxLevelPot = gameState.pots.some(pot => 
                    pot.farmId === farmId && pot.level === 8
                );
                
                const hasWarehouseMaxLevel = gameState.warehouse.some(pot =>
                    pot.farmId === farmId && pot.level === 8
                );
                
                if ((hasMaxLevelPot || hasWarehouseMaxLevel) && !gameState.farmUnlocked[farmId + 1]) {
                    gameState.farmUnlocked[farmId + 1] = true;
                    alert(\`🎉 축하합니다!\\n\\n농장 \${farmId}에서 최대 레벨을 달성하여\\n농장 \${farmId + 1}이(가) 해제되었습니다!\`);
                    updateFarmButtons();
                    saveGameState();
                }
            }
        }

        // Wallet functions
        function showWalletModal() {
            document.getElementById('wallet-balance-modal').textContent = gameState.walletBalance.toFixed(2);
            document.getElementById('wallet-modal').classList.remove('hidden');
        }

        function closeWalletModal() {
            document.getElementById('wallet-modal').classList.add('hidden');
        }

        function chargeWallet(amount) {
            gameState.walletBalance += amount;
            updateStats();
            saveGameState();
            document.getElementById('wallet-balance-modal').textContent = gameState.walletBalance.toFixed(2);
        }

        // Render Pots
        function renderPots() {
            const container = document.getElementById('pots-container');
            container.innerHTML = gameState.pots.map(pot => {
                const currentLevel = gameState.farmLevels[gameState.currentFarm]?.[pot.level];
                const nextLevel = gameState.farmLevels[gameState.currentFarm]?.[pot.level];
                
                if (!nextLevel) {
                    // 최대 레벨
                    return \`
                        <div class="pot-card bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-4 border-2 border-yellow-400">
                            <div class="text-center mb-3">
                                <div class="text-6xl mb-2">\${POT_EMOJIS[pot.level] || '🌴'}</div>
                                <div class="text-lg font-bold text-gray-800">화분 \${pot.id}</div>
                                <div class="text-2xl font-bold text-yellow-600">Lv.\${pot.level}</div>
                                <div class="text-xs text-yellow-600 mt-1">⭐ 최대 레벨!</div>
                            </div>
                            <button 
                                onclick="moveToWarehouse(\${pot.id})" 
                                class="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition text-sm"
                            >
                                🏛️ 창고로 보내기
                            </button>
                        </div>
                    \`;
                }

                // 🧪 테스트 모드: 조건 무시
                const canLevelUp = gameState.testMode ? true : (
                    gameState.heartAllowance >= nextLevel.hearts_required && 
                    gameState.heartsBalance >= nextLevel.hearts_required
                );

                const needsAllowance = nextLevel.hearts_required - gameState.heartAllowance;
                const needsHearts = nextLevel.hearts_required - gameState.heartsBalance;
                const needsCash = (nextLevel.stars * gameState.starPrice) - gameState.walletBalance;

                let buttonText = '⬆️ 레벨업';
                let tooltipText = '';
                
                if (!canLevelUp) {
                    buttonText = '🔒 조건 부족';
                    const reasons = [];
                    if (needsAllowance > 0) reasons.push(\`허용치 \${needsAllowance} 부족\`);
                    if (needsHearts > 0) reasons.push(\`하트 \${needsHearts} 부족\`);
                    if (nextLevel.stars > 0 && needsCash > 0) reasons.push(\`캐시 $\${needsCash.toFixed(2)} 부족\`);
                    tooltipText = reasons.join(', ');
                }

                // 레벨 0 화분 삭제 버튼
                const deleteButton = pot.level === 0 && gameState.pots.length > 1 ? \`
                    <button 
                        onclick="deletePot(\${pot.id})" 
                        class="w-full py-2 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition text-sm"
                    >
                        🗑️ 삭제
                    </button>
                \` : '';

                return \`
                    <div class="pot-card bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-4 border-2 border-green-300">
                        <div class="text-center mb-3">
                            <div class="text-6xl mb-2">\${POT_EMOJIS[pot.level] || '🏺'}</div>
                            <div class="text-lg font-bold text-gray-800">화분 \${pot.id}</div>
                            <div class="text-2xl font-bold text-green-600">Lv.\${pot.level}</div>
                            \${gameState.testMode ? '<div class="text-xs text-orange-600 mt-1">🧪 테스트 모드</div>' : ''}
                        </div>
                        \${!canLevelUp && tooltipText && !gameState.testMode ? \`
                            <div class="text-xs text-red-500 mb-2 text-center bg-red-50 rounded p-2">
                                \${tooltipText}
                            </div>
                        \` : ''}
                        <button 
                            onclick="attemptLevelUp(\${pot.id})" 
                            class="w-full py-2 \${canLevelUp ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'} text-white rounded-lg font-semibold transition text-sm"
                            \${!canLevelUp ? 'disabled' : ''}
                        >
                            \${buttonText}
                        </button>
                        \${deleteButton}
                    </div>
                \`;
            }).join('');
        }

        // Buy New Pot
        function buyNewPot() {
            if (gameState.pots.length >= 10) {
                alert('최대 10개의 화분까지만 구매할 수 있습니다!');
                return;
            }

            const newPot = {
                id: gameState.pots.length + 1,
                level: 0,
                farmId: gameState.currentFarm  // 현재 농장 ID 저장
            };
            
            gameState.pots.push(newPot);
            gameState.heartAllowance += 1; // 자신의 화분 추가로 허용치 증가
            
            renderPots();
            renderWarehouse();
            updateStats();
            saveGameState();
        }

        // Move pot to warehouse
        function moveToWarehouse(potId) {
            const pot = gameState.pots.find(p => p.id === potId);
            if (!pot) return;
            
            if (pot.level !== 8) {
                alert('최대 레벨(Lv.8) 화분만 창고로 보낼 수 있습니다!');
                return;
            }
            
            if (confirm(\`화분 \${potId}을(를) 창고로 보내시겠습니까?\\n\\n창고로 보낸 화분은 다시 꺼낼 수 없지만, 다음 농장을 해제하는데 도움이 됩니다.\`)) {
                // 창고로 이동
                gameState.warehouse.push({ ...pot });
                
                // 화분 목록에서 제거
                gameState.pots = gameState.pots.filter(p => p.id !== potId);
                
                // ID 재정렬
                gameState.pots.forEach((p, idx) => {
                    p.id = idx + 1;
                });
                
                // 허용치 조정 (창고로 보낸 화분은 더 이상 허용치에 기여하지 않음)
                gameState.heartAllowance -= 1;
                
                renderPots();
                renderWarehouse();
                updateStats();
                checkFarmUnlock();  // 농장 해제 확인
                saveGameState();
                
                alert('화분이 창고로 이동되었습니다! 🏛️');
            }
        }

        // Render Warehouse
        function renderWarehouse() {
            const container = document.getElementById('warehouse-container');
            const emptyMessage = document.getElementById('warehouse-empty');
            const countDisplay = document.getElementById('warehouse-count');
            
            countDisplay.textContent = gameState.warehouse.length;
            
            if (gameState.warehouse.length === 0) {
                container.innerHTML = '';
                emptyMessage.classList.remove('hidden');
            } else {
                emptyMessage.classList.add('hidden');
                container.innerHTML = gameState.warehouse.map((pot, idx) => \`
                    <div class="pot-card bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 border-2 border-purple-300">
                        <div class="text-center">
                            <div class="text-6xl mb-2">\${POT_EMOJIS[pot.level] || '🌴'}</div>
                            <div class="text-sm font-bold text-gray-800">창고 화분 #\${idx + 1}</div>
                            <div class="text-lg font-bold text-purple-600">Lv.\${pot.level}</div>
                            <div class="text-xs text-purple-600 mt-1">농장 \${pot.farmId}</div>
                        </div>
                    </div>
                \`).join('');
            }
        }

        // Attempt Level Up
        function attemptLevelUp(potId) {
            const pot = gameState.pots.find(p => p.id === potId);
            if (!pot) return;

            const nextLevel = gameState.farmLevels[gameState.currentFarm]?.[pot.level];
            if (!nextLevel) {
                alert('최대 레벨에 도달했습니다!');
                return;
            }

            // 🧪 테스트 모드가 아닐 때만 조건 체크
            if (!gameState.testMode) {
                // Check conditions
                if (gameState.heartAllowance < nextLevel.hearts_required) {
                    alert(\`하트 허용치가 부족합니다!\\n필요: \${nextLevel.hearts_required}, 보유: \${gameState.heartAllowance}\\n부족: \${nextLevel.hearts_required - gameState.heartAllowance}\`);
                    return;
                }

                if (gameState.heartsBalance < nextLevel.hearts_required) {
                    alert(\`하트가 부족합니다!\\n필요: \${nextLevel.hearts_required}, 보유: \${gameState.heartsBalance}\\n부족: \${nextLevel.hearts_required - gameState.heartsBalance}\`);
                    return;
                }

                // Check wallet balance for stars
                const starCost = nextLevel.stars * gameState.starPrice;
                if (nextLevel.stars > 0 && gameState.walletBalance < starCost) {
                    alert(\`지갑 잔액이 부족합니다!\\n필요: $\${starCost.toFixed(2)}, 보유: $\${gameState.walletBalance.toFixed(2)}\\n부족: $\${(starCost - gameState.walletBalance).toFixed(2)}\\n\\n💰 지갑을 충전해주세요!\`);
                    return;
                }
            }

            // Level up!
            if (!gameState.testMode) {
                gameState.heartsBalance -= nextLevel.hearts_required;
                gameState.heartAllowance -= nextLevel.hearts_required;
                
                // Charge for stars
                const starCost = nextLevel.stars * gameState.starPrice;
                if (nextLevel.stars > 0) {
                    gameState.walletBalance -= starCost;
                    gameState.starsPurchased += nextLevel.stars;
                }
            } else {
                // 🧪 테스트 모드: 통계만 기록
                gameState.testStats.stars += nextLevel.stars;
                gameState.testStats.coins += nextLevel.coins;
                gameState.testStats.allowance += nextLevel.hearts_required;
                updateTestStats();
            }
            
            gameState.coinsEarned += nextLevel.coins;
            gameState.heartsBalance += nextLevel.hearts_reward;
            
            pot.level += 1;

            // Show modal
            showLevelUpModal(pot.id, pot.level, nextLevel.coins, nextLevel.hearts_reward);

            renderPots();
            renderWarehouse();
            updateStats();
            checkFarmUnlock();  // 레벨업 후 농장 해제 확인
            saveGameState();
        }

        // Show Level Up Modal
        function showLevelUpModal(potNum, level, coins, hearts) {
            // 화분 카드에 애니메이션 추가
            const potCards = document.querySelectorAll('.pot-card');
            if (potCards[potNum - 1]) {
                potCards[potNum - 1].classList.add('level-up-animation');
                setTimeout(() => {
                    potCards[potNum - 1].classList.remove('level-up-animation');
                }, 600);
            }
            
            document.getElementById('modal-pot-num').textContent = potNum;
            document.getElementById('modal-level').textContent = level;
            document.getElementById('modal-coins').textContent = coins;
            document.getElementById('modal-hearts').textContent = hearts;
            document.getElementById('levelup-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('levelup-modal').classList.add('hidden');
        }

        // 🧪 Toggle Test Mode
        function toggleTestMode() {
            gameState.testMode = !gameState.testMode;
            const btn = document.getElementById('test-mode-btn');
            const statsDiv = document.getElementById('test-mode-stats');
            
            if (gameState.testMode) {
                btn.textContent = '🧪 테스트 모드: ON';
                btn.className = 'px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition';
                statsDiv.classList.remove('hidden');
                // 테스트 통계 초기화
                gameState.testStats = { stars: 0, coins: 0, allowance: 0 };
                updateTestStats();
            } else {
                btn.textContent = '🧪 테스트 모드: OFF';
                btn.className = 'px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold transition';
                statsDiv.classList.add('hidden');
            }
            renderPots();
            saveGameState();
        }

        // 🔄 Reset Farm
        function resetFarm() {
            if (!confirm(\`농장 \${gameState.currentFarm}을(를) 초기화하시겠습니까?\\n\\n모든 화분과 창고가 삭제되고 초기 상태로 돌아갑니다.\`)) {
                return;
            }

            // 초기 상태로 리셋
            gameState.walletBalance = 0;
            gameState.heartsBalance = 300000;
            gameState.heartAllowance = 1;
            gameState.starsPurchased = 0;
            gameState.coinsEarned = 0;
            gameState.pots = [{ id: 1, level: 0, farmId: gameState.currentFarm }];
            gameState.warehouse = [];  // 창고 초기화
            gameState.farmUnlocked = { 1: true, 2: false, 3: false, 4: false };  // 농장 잠금 초기화
            gameState.testMode = false;
            gameState.testStats = { stars: 0, coins: 0, allowance: 0 };

            // UI 업데이트
            const btn = document.getElementById('test-mode-btn');
            btn.textContent = '🧪 테스트 모드: OFF';
            btn.className = 'px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold transition';
            document.getElementById('test-mode-stats').classList.add('hidden');

            updateFarmButtons();  // 농장 버튼 업데이트
            renderPots();
            renderWarehouse();
            updateStats();
            saveGameState();
            
            alert('농장이 초기화되었습니다!');
        }

        // 🗑️ Delete Pot
        function deletePot(potId) {
            const pot = gameState.pots.find(p => p.id === potId);
            if (!pot) return;

            if (pot.level !== 0) {
                alert('레벨 0인 화분만 삭제할 수 있습니다!');
                return;
            }

            if (gameState.pots.length <= 1) {
                alert('최소 1개의 화분은 있어야 합니다!');
                return;
            }

            if (confirm(\`화분 \${potId}을(를) 삭제하시겠습니까?\`)) {
                gameState.pots = gameState.pots.filter(p => p.id !== potId);
                gameState.heartAllowance -= 1; // 화분 삭제로 허용치 감소
                
                // ID 재정렬
                gameState.pots.forEach((p, idx) => {
                    p.id = idx + 1;
                });

                renderPots();
                renderWarehouse();
                updateStats();
                saveGameState();
            }
        }

        // Update Stats Display
        function updateStats() {
            document.getElementById('wallet-balance').textContent = \`$\${gameState.walletBalance.toFixed(2)}\`;
            document.getElementById('hearts-balance').textContent = gameState.heartsBalance;
            document.getElementById('hearts-allowance').textContent = gameState.heartAllowance;
            document.getElementById('stars-purchased').textContent = gameState.starsPurchased;
            document.getElementById('coins-earned').textContent = gameState.coinsEarned;
            document.getElementById('pots-count').textContent = gameState.pots.length;
        }

        // Update Test Mode Stats
        function updateTestStats() {
            if (gameState.testMode) {
                document.getElementById('test-stars').textContent = \`\${gameState.testStats.stars}개\`;
                document.getElementById('test-coins').textContent = \`\${gameState.testStats.coins}개\`;
                document.getElementById('test-allowance').textContent = \`\${gameState.testStats.allowance}개\`;
            }
        }

        // Render Level Info
        function renderLevelInfo() {
            const tbody = document.getElementById('level-info-tbody');
            const levels = gameState.farmLevels[gameState.currentFarm] || [];
            
            tbody.innerHTML = levels.map((level, idx) => \`
                <tr class="border-t hover:bg-gray-50">
                    <td class="px-4 py-2 text-center font-semibold">Lv.\${idx + 1}</td>
                    <td class="px-4 py-2 text-center">\${level.hearts_required}</td>
                    <td class="px-4 py-2 text-center">\${level.stars}</td>
                    <td class="px-4 py-2 text-center">\${level.coins}</td>
                    <td class="px-4 py-2 text-center">\${level.hearts_reward}</td>
                </tr>
            \`).join('');
        }

        // Level Edit Modal Functions
        function showLevelEditModal() {
            const modal = document.getElementById('level-edit-modal');
            const farmDisplay = document.getElementById('edit-farm-display');
            const tbody = document.getElementById('level-edit-tbody');
            
            farmDisplay.textContent = gameState.currentFarm;
            
            const levels = gameState.farmLevels[gameState.currentFarm] || [];
            tbody.innerHTML = levels.map((level, idx) => \`
                <tr>
                    <td class="px-3 py-2 text-center font-semibold">Lv.\${level.level}</td>
                    <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="\${level.hearts_required}" min="0" data-level="\${level.level}" data-field="hearts_required"></td>
                    <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="\${level.stars}" min="0" data-level="\${level.level}" data-field="stars"></td>
                    <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="\${level.coins}" min="0" data-level="\${level.level}" data-field="coins"></td>
                    <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 border rounded text-center" value="\${level.hearts_reward}" min="0" data-level="\${level.level}" data-field="hearts_reward"></td>
                </tr>
            \`).join('');
            
            modal.classList.remove('hidden');
        }

        function closeLevelEditModal() {
            document.getElementById('level-edit-modal').classList.add('hidden');
        }

        function saveLevelEdit() {
            const farmId = gameState.currentFarm;
            const tbody = document.getElementById('level-edit-tbody');
            const newLevels = [];
            
            for (let i = 1; i <= 8; i++) {
                const row = tbody.querySelector(\`tr:nth-child(\${i})\`);
                if (row) {
                    const inputs = row.querySelectorAll('input[data-field]');
                    const levelData = { level: i };
                    
                    inputs.forEach(input => {
                        const field = input.getAttribute('data-field');
                        levelData[field] = parseInt(input.value) || 0;
                    });
                    
                    newLevels.push(levelData);
                }
            }
            
            // gameState 업데이트
            gameState.farmLevels[farmId] = newLevels;
            
            // localStorage에 게임하기 전용 설정 저장
            localStorage.setItem(\`game_farm\${farmId}_levels\`, JSON.stringify(newLevels));
            
            renderLevelInfo();
            renderPots(); // 레벨 조건이 바뀌었으므로 화분 다시 렌더링
            saveGameState();
            closeLevelEditModal();
            
            alert(\`농장 \${farmId}의 레벨 설정이 저장되었습니다!\`);
            console.log(\`Game: Farm \${farmId} levels saved\`, newLevels);
        }

        function resetLevelToSimulator() {
            const farmId = gameState.currentFarm;
            
            if (!confirm(\`농장 \${farmId}의 레벨 설정을 설정하기(시뮬레이터)의 현재 값으로 복원하시겠습니까?\`)) {
                return;
            }
            
            // localStorage에서 시뮬레이터 설정 가져오기
            const simulatorConfig = localStorage.getItem(\`farm\${farmId}_config\`);
            if (simulatorConfig) {
                try {
                    const config = JSON.parse(simulatorConfig);
                    if (config.levels && config.levels.length > 0) {
                        gameState.farmLevels[farmId] = config.levels;
                        
                        // 게임하기 전용 설정 삭제
                        localStorage.removeItem(\`game_farm\${farmId}_levels\`);
                        
                        renderLevelInfo();
                        renderPots();
                        saveGameState();
                        
                        // 모달 닫고 다시 열어서 새 값 표시
                        closeLevelEditModal();
                        showLevelEditModal();
                        
                        alert(\`농장 \${farmId} 레벨 설정이 시뮬레이터 값으로 복원되었습니다!\`);
                        console.log(\`Game: Farm \${farmId} restored from simulator\`, config.levels);
                    } else {
                        alert('시뮬레이터에 저장된 값이 없습니다. 기본값을 사용합니다.');
                    }
                } catch (e) {
                    console.error('Failed to restore from simulator:', e);
                    alert('복원에 실패했습니다.');
                }
            } else {
                alert('시뮬레이터에 저장된 설정이 없습니다.');
            }
        }

        // Initialize on page load
        initGame();
    </script>
</body>
</html>
`;
