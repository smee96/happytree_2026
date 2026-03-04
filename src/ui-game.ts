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
            <h2 class="text-xl font-bold text-gray-800 mb-4">📊 내 상태</h2>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
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

        <!-- Level Info -->
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">📋 레벨 정보 (농장 <span id="current-farm-display">1</span>)</h2>
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

    <!-- Level Up Modal -->
    <div id="levelup-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-3xl font-bold text-gray-800 mb-2">레벨 업!</h3>
            <p class="text-xl text-gray-600 mb-4">화분 <span id="modal-pot-num"></span>이(가) Lv.<span id="modal-level"></span>에 도달했습니다!</p>
            <div class="bg-green-50 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div class="text-gray-600">코인 획득</div>
                        <div class="text-2xl font-bold text-amber-600">+<span id="modal-coins">0</span></div>
                    </div>
                    <div>
                        <div class="text-gray-600">하트 획득</div>
                        <div class="text-2xl font-bold text-red-600">+<span id="modal-hearts">0</span></div>
                    </div>
                </div>
            </div>
            <button onclick="closeModal()" class="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition">
                확인
            </button>
        </div>
    </div>

    <script>
        // Game State
        let gameState = {
            currentFarm: 1,
            heartsBalance: 300000,
            heartAllowance: 1,
            starsPurchased: 0,
            coinsEarned: 0,
            pots: [
                { id: 1, level: 0 }
            ],
            farmLevels: {}
        };

        // Load farm levels configuration
        async function loadFarmLevels() {
            try {
                const response = await fetch('/api/farm-levels');
                const data = await response.json();
                gameState.farmLevels = data;
                renderLevelInfo();
            } catch (error) {
                console.error('Failed to load farm levels:', error);
            }
        }

        // Initialize game
        function initGame() {
            loadFarmLevels();
            loadGameState();
            renderPots();
            updateStats();
        }

        // Save/Load game state
        function saveGameState() {
            localStorage.setItem('happytree_game', JSON.stringify(gameState));
        }

        function loadGameState() {
            const saved = localStorage.getItem('happytree_game');
            if (saved) {
                gameState = JSON.parse(saved);
            }
        }

        // Select Farm
        function selectFarm(farmId) {
            gameState.currentFarm = farmId;
            
            // Update button styles
            for (let i = 1; i <= 4; i++) {
                const btn = document.getElementById(\`farm-btn-\${i}\`);
                if (i === farmId) {
                    btn.className = 'farm-btn px-6 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition';
                } else {
                    btn.className = 'farm-btn px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition';
                }
            }
            
            document.getElementById('current-farm-display').textContent = farmId;
            renderLevelInfo();
            saveGameState();
        }

        // Render Pots
        function renderPots() {
            const container = document.getElementById('pots-container');
            container.innerHTML = gameState.pots.map(pot => {
                const currentLevel = gameState.farmLevels[gameState.currentFarm]?.[pot.level];
                const nextLevel = gameState.farmLevels[gameState.currentFarm]?.[pot.level + 1];
                const canLevelUp = nextLevel && 
                    gameState.heartAllowance >= nextLevel.hearts_required && 
                    gameState.heartsBalance >= nextLevel.hearts_required;

                return \`
                    <div class="pot-card bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-4 border-2 border-green-300">
                        <div class="text-center mb-3">
                            <div class="text-4xl mb-2">🪴</div>
                            <div class="text-lg font-bold text-gray-800">화분 \${pot.id}</div>
                            <div class="text-2xl font-bold text-green-600">Lv.\${pot.level}</div>
                        </div>
                        <button 
                            onclick="attemptLevelUp(\${pot.id})" 
                            class="w-full py-2 \${canLevelUp ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'} text-white rounded-lg font-semibold transition"
                            \${!canLevelUp ? 'disabled' : ''}
                        >
                            \${canLevelUp ? '⬆️ 레벨업' : '🔒 조건 부족'}
                        </button>
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
                level: 0
            };
            
            gameState.pots.push(newPot);
            gameState.heartAllowance += 1; // 자신의 화분 추가로 허용치 증가
            
            renderPots();
            updateStats();
            saveGameState();
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

            // Check conditions
            if (gameState.heartAllowance < nextLevel.hearts_required) {
                alert(\`하트 허용치가 부족합니다! (필요: \${nextLevel.hearts_required}, 보유: \${gameState.heartAllowance})\`);
                return;
            }

            if (gameState.heartsBalance < nextLevel.hearts_required) {
                alert(\`하트가 부족합니다! (필요: \${nextLevel.hearts_required}, 보유: \${gameState.heartsBalance})\`);
                return;
            }

            // Level up!
            gameState.heartsBalance -= nextLevel.hearts_required;
            gameState.heartAllowance -= nextLevel.hearts_required;
            gameState.heartsSpent += nextLevel.hearts_required;
            
            gameState.starsPurchased += nextLevel.stars;
            gameState.coinsEarned += nextLevel.coins;
            gameState.heartsBalance += nextLevel.hearts_reward;
            
            pot.level += 1;

            // Show modal
            showLevelUpModal(pot.id, pot.level, nextLevel.coins, nextLevel.hearts_reward);

            renderPots();
            updateStats();
            saveGameState();
        }

        // Show Level Up Modal
        function showLevelUpModal(potNum, level, coins, hearts) {
            document.getElementById('modal-pot-num').textContent = potNum;
            document.getElementById('modal-level').textContent = level;
            document.getElementById('modal-coins').textContent = coins;
            document.getElementById('modal-hearts').textContent = hearts;
            document.getElementById('levelup-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('levelup-modal').classList.add('hidden');
        }

        // Update Stats Display
        function updateStats() {
            document.getElementById('hearts-balance').textContent = gameState.heartsBalance;
            document.getElementById('hearts-allowance').textContent = gameState.heartAllowance;
            document.getElementById('stars-purchased').textContent = gameState.starsPurchased;
            document.getElementById('coins-earned').textContent = gameState.coinsEarned;
            document.getElementById('pots-count').textContent = gameState.pots.length;
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

        // Initialize on page load
        initGame();
    </script>
</body>
</html>
`;
