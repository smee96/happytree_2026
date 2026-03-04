export const mainPageTemplate = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HappyTree Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .floating {
            animation: float 3s ease-in-out infinite;
        }
        .btn-game {
            transition: all 0.3s ease;
            transform: scale(1);
        }
        .btn-game:hover {
            transform: scale(1.05);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body class="bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
        <!-- Header -->
        <div class="text-center mb-12">
            <div class="floating inline-block text-8xl mb-4">🌳</div>
            <h1 class="text-6xl font-bold text-gray-800 mb-4">HappyTree</h1>
            <p class="text-xl text-gray-600">나만의 화분을 키우고 네트워크를 확장하세요</p>
        </div>

        <!-- Main Buttons -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- 게임하기 버튼 -->
            <a href="/game" class="btn-game block">
                <div class="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl">
                    <div class="text-6xl mb-4">🎮</div>
                    <h2 class="text-3xl font-bold text-white mb-2">게임하기</h2>
                    <p class="text-green-100">화분을 키우고 레벨업하세요</p>
                </div>
            </a>

            <!-- 설정하기 버튼 -->
            <a href="/simulator" class="btn-game block">
                <div class="bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl">
                    <div class="text-6xl mb-4">⚙️</div>
                    <h2 class="text-3xl font-bold text-white mb-2">설정하기</h2>
                    <p class="text-purple-100">시뮬레이터로 전략 수립하기</p>
                </div>
            </a>
        </div>

        <!-- 게임 소개 -->
        <div class="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">🌱 게임 소개</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div class="p-4">
                    <div class="text-4xl mb-2">💚</div>
                    <h4 class="font-bold text-gray-700 mb-1">하트 허용치</h4>
                    <p class="text-sm text-gray-600">네트워크를 확장하여 허용치를 늘리세요</p>
                </div>
                <div class="p-4">
                    <div class="text-4xl mb-2">⭐</div>
                    <h4 class="font-bold text-gray-700 mb-1">별 구매</h4>
                    <p class="text-sm text-gray-600">별을 구매하여 화분을 레벨업하세요</p>
                </div>
                <div class="p-4">
                    <div class="text-4xl mb-2">🪙</div>
                    <h4 class="font-bold text-gray-700 mb-1">코인 획득</h4>
                    <p class="text-sm text-gray-600">높은 레벨에 도달하여 코인을 받으세요</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-gray-600 text-sm">
            <p>© 2024 HappyTree Game. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
