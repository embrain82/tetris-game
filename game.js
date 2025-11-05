// 게임 상수
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = {
    I: '#00f0f0', // 하늘색
    O: '#f0f000', // 노란색
    T: '#a000f0', // 보라색
    L: '#f0a000', // 주황색
    J: '#0000f0', // 파란색
    S: '#00f000', // 초록색
    Z: '#f00000', // 빨간색
    EMPTY: '#000000',
    GHOST: 'rgba(255, 255, 255, 0.2)'
};

// 테트로미노 정의 (각 회전 상태)
const TETROMINOS = {
    I: [
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
        [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
        [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    O: [
        [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]]
    ],
    T: [
        [[0,1,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,0,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
        [[0,0,0,0], [1,1,1,0], [0,1,0,0], [0,0,0,0]],
        [[0,1,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]
    ],
    L: [
        [[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [0,1,1,0], [0,0,0,0]],
        [[0,0,0,0], [1,1,1,0], [1,0,0,0], [0,0,0,0]],
        [[1,1,0,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]]
    ],
    J: [
        [[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,1,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]],
        [[0,0,0,0], [1,1,1,0], [0,0,1,0], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [1,1,0,0], [0,0,0,0]]
    ],
    S: [
        [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,0,0], [0,1,1,0], [0,0,1,0], [0,0,0,0]],
        [[0,0,0,0], [0,1,1,0], [1,1,0,0], [0,0,0,0]],
        [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]
    ],
    Z: [
        [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,0,1,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
        [[0,0,0,0], [1,1,0,0], [0,1,1,0], [0,0,0,0]],
        [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]]
    ]
};

const PIECE_TYPES = Object.keys(TETROMINOS);

// 게임 상태
let game = {
    board: [],
    currentPiece: null,
    currentX: 0,
    currentY: 0,
    currentRotation: 0,
    holdPiece: null,
    canHold: true,
    nextPieces: [],
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    paused: false,
    started: false,
    dropCounter: 0,
    dropInterval: 1000,
    lastTime: 0,
    animating: false,
    particles: [],
    hintsRemaining: 5,
    showingHint: false,
    hintPosition: null
};

// Canvas 요소
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');
const nextCanvases = [
    document.getElementById('nextCanvas1'),
    document.getElementById('nextCanvas2'),
    document.getElementById('nextCanvas3')
];
const nextCtxs = nextCanvases.map(c => c.getContext('2d'));

// UI 요소
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const overlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const hintsElement = document.getElementById('hints');

// 게임 보드 초기화
function initBoard() {
    game.board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

// 랜덤 피스 생성
function randomPiece() {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

// 다음 피스 큐 초기화
function initNextPieces() {
    game.nextPieces = [randomPiece(), randomPiece(), randomPiece()];
}

// 새 피스 생성
function newPiece() {
    const type = game.nextPieces.shift();
    game.nextPieces.push(randomPiece());

    game.currentPiece = type;
    game.currentRotation = 0;
    game.currentX = Math.floor(COLS / 2) - 2;
    game.currentY = 0;
    game.canHold = true;

    if (collision()) {
        gameOver();
    }
}

// 현재 피스의 모양 가져오기
function getCurrentShape() {
    const rotations = TETROMINOS[game.currentPiece];
    return rotations[game.currentRotation % rotations.length];
}

// 충돌 감지
function collision(x = game.currentX, y = game.currentY, rotation = game.currentRotation, piece = game.currentPiece) {
    if (!piece) return true;
    const shape = TETROMINOS[piece][rotation % TETROMINOS[piece].length];

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }

                if (newY >= 0 && game.board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 피스를 보드에 고정
async function lockPiece() {
    const shape = getCurrentShape();

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardY = game.currentY + row;
                const boardX = game.currentX + col;
                if (boardY >= 0) {
                    game.board[boardY][boardX] = game.currentPiece;
                }
            }
        }
    }

    await clearLines();
    newPiece();
}

// 파티클 클래스
class Particle {
    constructor(x, y, color, lineCount) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * (2 + lineCount * 2);
        this.vy = (Math.random() - 0.5) * (2 + lineCount * 2) - lineCount;
        this.life = 1.0;
        this.decay = 0.01 + Math.random() * 0.02;
        this.size = 3 + lineCount * 2;
        this.color = color;
        this.gravity = 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

// 파티클 생성
function createParticles(rows, lineCount) {
    const colors = [
        ['#ffff00', '#ffd700'], // 1줄 - 노란색
        ['#ffa500', '#ff8c00', '#ffff00'], // 2줄 - 주황색
        ['#ff4500', '#ff6347', '#ffa500'], // 3줄 - 빨간색
        ['#ff0000', '#ffd700', '#ff1493', '#00ffff'] // 4줄 (테트리스) - 무지개색
    ];

    const particleColors = colors[lineCount - 1];
    const particleCount = 20 * lineCount;

    for (const row of rows) {
        for (let col = 0; col < COLS; col++) {
            const numParticles = Math.floor(particleCount / (rows.length * COLS));
            for (let i = 0; i < numParticles; i++) {
                const x = col * BLOCK_SIZE + BLOCK_SIZE / 2;
                const y = row * BLOCK_SIZE + BLOCK_SIZE / 2;
                const color = particleColors[Math.floor(Math.random() * particleColors.length)];
                game.particles.push(new Particle(x, y, color, lineCount));
            }
        }
    }
}

// 줄 제거 (비동기 애니메이션 포함)
async function clearLines() {
    const fullRows = [];

    for (let row = ROWS - 1; row >= 0; row--) {
        if (game.board[row].every(cell => cell !== 0)) {
            fullRows.push(row);
        }
    }

    if (fullRows.length > 0) {
        game.animating = true;

        // 애니메이션 효과
        await animateLineClear(fullRows);

        // 파티클 생성
        createParticles(fullRows, fullRows.length);

        // 줄 제거
        for (const row of fullRows.sort((a, b) => a - b)) {
            game.board.splice(row, 1);
            game.board.unshift(Array(COLS).fill(0));
        }

        game.lines += fullRows.length;

        // 점수 계산
        const linePoints = [0, 100, 300, 500, 800];
        game.score += linePoints[fullRows.length];

        // 레벨 계산 (10줄마다 레벨 업)
        game.level = Math.floor(game.lines / 10) + 1;

        // 낙하 속도 조정
        game.dropInterval = Math.max(100, 1000 - (game.level - 1) * 50);

        updateUI();
        game.animating = false;
    }
}

// 줄 제거 애니메이션
function animateLineClear(rows) {
    return new Promise((resolve) => {
        const duration = 400; // 애니메이션 지속 시간 (ms)
        const flashCount = 4; // 깜빡임 횟수
        const flashInterval = duration / (flashCount * 2);
        let elapsed = 0;
        let flashState = false;
        const originalColors = [];

        // 원래 색상 저장
        for (const row of rows) {
            originalColors[row] = game.board[row].map(cell => cell);
        }

        const flashColors = [
            '#ffffff', // 1줄 - 흰색
            '#ffff00', // 2줄 - 노란색
            '#ff8c00', // 3줄 - 주황색
            '#ff0000'  // 4줄 - 빨간색
        ];

        const flashColor = flashColors[rows.length - 1];

        const animate = () => {
            elapsed += flashInterval;

            // 깜빡임 효과
            flashState = !flashState;
            for (const row of rows) {
                for (let col = 0; col < COLS; col++) {
                    if (flashState) {
                        game.board[row][col] = 'FLASH';
                    } else {
                        game.board[row][col] = originalColors[row][col];
                    }
                }
            }

            // 임시로 FLASH 색상을 추가
            COLORS.FLASH = flashColor;

            drawBoard();

            if (elapsed < duration) {
                setTimeout(animate, flashInterval);
            } else {
                resolve();
            }
        };

        animate();
    });
}

// 피스 이동
function move(dir) {
    game.currentX += dir;
    if (collision()) {
        game.currentX -= dir;
        return false;
    }
    return true;
}

// 피스 회전
function rotate() {
    const prevRotation = game.currentRotation;
    game.currentRotation = (game.currentRotation + 1) % TETROMINOS[game.currentPiece].length;

    // 회전 후 충돌하면 Wall Kick 시도
    if (collision()) {
        // 왼쪽, 오른쪽으로 이동 시도
        if (!collision(game.currentX + 1, game.currentY, game.currentRotation)) {
            game.currentX += 1;
        } else if (!collision(game.currentX - 1, game.currentY, game.currentRotation)) {
            game.currentX -= 1;
        } else {
            game.currentRotation = prevRotation;
            return false;
        }
    }
    return true;
}

// 소프트 드롭
function softDrop() {
    game.currentY++;
    if (collision()) {
        game.currentY--;
        lockPiece();
        return false;
    }
    game.score += 1;
    return true;
}

// 하드 드롭
function hardDrop() {
    let dropDistance = 0;
    while (!collision(game.currentX, game.currentY + 1, game.currentRotation)) {
        game.currentY++;
        dropDistance++;
    }
    game.score += dropDistance * 2;
    lockPiece();
}

// 고스트 피스 Y 위치 계산
function getGhostY() {
    let ghostY = game.currentY;
    while (!collision(game.currentX, ghostY + 1, game.currentRotation)) {
        ghostY++;
    }
    return ghostY;
}

// 홀드 기능
function hold() {
    if (!game.canHold) return;

    game.canHold = false;

    if (game.holdPiece === null) {
        game.holdPiece = game.currentPiece;
        newPiece();
    } else {
        const temp = game.holdPiece;
        game.holdPiece = game.currentPiece;
        game.currentPiece = temp;
        game.currentRotation = 0;
        game.currentX = Math.floor(COLS / 2) - 2;
        game.currentY = 0;
    }

    drawHold();
}

// AI 힌트 시스템

// 보드 복사
function copyBoard(board) {
    return board.map(row => [...row]);
}

// 특정 위치에 피스를 보드에 추가 (가상)
function placePieceOnBoard(board, piece, x, y, rotation) {
    const newBoard = copyBoard(board);
    const shape = TETROMINOS[piece][rotation % TETROMINOS[piece].length];

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardY = y + row;
                const boardX = x + col;
                if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                    newBoard[boardY][boardX] = piece;
                }
            }
        }
    }

    return newBoard;
}

// 보드 평가 함수
function evaluateBoard(board) {
    let score = 0;

    // 1. 높이 평가 (낮을수록 좋음)
    let maxHeight = 0;
    let totalHeight = 0;
    const columnHeights = [];

    for (let col = 0; col < COLS; col++) {
        let height = 0;
        for (let row = 0; row < ROWS; row++) {
            if (board[row][col]) {
                height = ROWS - row;
                break;
            }
        }
        columnHeights.push(height);
        totalHeight += height;
        maxHeight = Math.max(maxHeight, height);
    }

    score -= maxHeight * 10; // 최대 높이 페널티
    score -= totalHeight * 2; // 전체 높이 페널티

    // 2. 구멍 카운트 (적을수록 좋음)
    let holes = 0;
    for (let col = 0; col < COLS; col++) {
        let blockFound = false;
        for (let row = 0; row < ROWS; row++) {
            if (board[row][col]) {
                blockFound = true;
            } else if (blockFound) {
                holes++;
            }
        }
    }
    score -= holes * 50; // 구멍 페널티 (매우 중요)

    // 3. 완성된 줄 보너스
    let completedLines = 0;
    for (let row = 0; row < ROWS; row++) {
        if (board[row].every(cell => cell !== 0)) {
            completedLines++;
        }
    }
    score += completedLines * 100; // 줄 완성 보너스

    // 4. 평탄도 평가 (높이 차이가 적을수록 좋음)
    let bumpiness = 0;
    for (let i = 0; i < columnHeights.length - 1; i++) {
        bumpiness += Math.abs(columnHeights[i] - columnHeights[i + 1]);
    }
    score -= bumpiness * 5; // 평탄도 페널티

    // 5. 벽과 바닥 접촉 보너스
    let touching = 0;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                // 아래 접촉
                if (row === ROWS - 1 || board[row + 1][col]) touching++;
                // 좌우 접촉
                if (col === 0 || board[row][col - 1]) touching++;
                if (col === COLS - 1 || board[row][col + 1]) touching++;
            }
        }
    }
    score += touching * 2; // 접촉 보너스

    return score;
}

// 최적 위치 찾기
function findBestPosition() {
    if (!game.currentPiece) return null;

    let bestScore = -Infinity;
    let bestPosition = null;

    const piece = game.currentPiece;
    const rotations = TETROMINOS[piece].length;

    // 모든 회전과 x 위치 시도
    for (let rotation = 0; rotation < rotations; rotation++) {
        for (let x = -2; x < COLS + 2; x++) {
            // y 위치 찾기 (가장 아래로)
            let y = 0;
            while (!collision(x, y, rotation, piece)) {
                y++;
            }
            y--; // 마지막 유효 위치

            // 유효한 위치인지 확인
            if (!collision(x, y, rotation, piece) && y >= 0) {
                // 이 위치에 피스를 놓은 후 보드 평가
                const testBoard = placePieceOnBoard(game.board, piece, x, y, rotation);
                const score = evaluateBoard(testBoard);

                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = { x, y, rotation };
                }
            }
        }
    }

    return bestPosition;
}

// 힌트 표시
function showHint() {
    if (game.animating || !game.currentPiece) {
        return;
    }

    if (game.hintsRemaining <= 0) {
        // 힌트가 남아있지 않을 때 메시지 표시
        const tempMessage = document.createElement('div');
        tempMessage.style.position = 'fixed';
        tempMessage.style.top = '50%';
        tempMessage.style.left = '50%';
        tempMessage.style.transform = 'translate(-50%, -50%)';
        tempMessage.style.background = 'rgba(255, 0, 0, 0.9)';
        tempMessage.style.color = 'white';
        tempMessage.style.padding = '20px 40px';
        tempMessage.style.borderRadius = '10px';
        tempMessage.style.fontSize = '24px';
        tempMessage.style.fontWeight = 'bold';
        tempMessage.style.zIndex = '10000';
        tempMessage.textContent = 'No hints remaining!';
        document.body.appendChild(tempMessage);

        setTimeout(() => {
            document.body.removeChild(tempMessage);
        }, 2000);
        return;
    }

    game.hintsRemaining--;
    game.showingHint = true;
    game.hintPosition = findBestPosition();

    updateUI();

    // 3초 후 힌트 숨김
    setTimeout(() => {
        game.showingHint = false;
        game.hintPosition = null;
    }, 3000);
}

// 게임 오버
function gameOver() {
    game.gameOver = true;
    game.started = false;
    showOverlay('GAME OVER', `Final Score: ${game.score}\nLines: ${game.lines} | Level: ${game.level}`, [
        {
            text: 'Restart (Space)',
            primary: true,
            onClick: () => {
                resetGame();
                startGame();
            }
        }
    ]);
}

// UI 업데이트
function updateUI() {
    scoreElement.textContent = game.score;
    levelElement.textContent = game.level;
    linesElement.textContent = game.lines;
    hintsElement.textContent = game.hintsRemaining;
}

// 오버레이 표시
function showOverlay(title, message, buttons = []) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;

    // 버튼 컨테이너 초기화
    const buttonsContainer = document.getElementById('overlayButtons');
    buttonsContainer.innerHTML = '';

    // 버튼 추가
    if (buttons.length > 0) {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'overlay-buttons';

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'overlay-button' + (btn.primary ? ' primary' : '');
            button.textContent = btn.text;
            button.onclick = btn.onClick;
            buttonWrapper.appendChild(button);
        });

        buttonsContainer.appendChild(buttonWrapper);
    }

    overlay.classList.remove('hidden');
}

// 오버레이 숨김
function hideOverlay() {
    overlay.classList.add('hidden');
    const buttonsContainer = document.getElementById('overlayButtons');
    buttonsContainer.innerHTML = '';
}

// 게임 보드 그리기
function drawBoard() {
    // 배경
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 그리드
    ctx.strokeStyle = '#222';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // 고정된 블록
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (game.board[row][col]) {
                ctx.fillStyle = COLORS[game.board[row][col]];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    if (game.currentPiece && !game.animating) {
        // 힌트 표시
        if (game.showingHint && game.hintPosition) {
            const hintShape = TETROMINOS[game.currentPiece][game.hintPosition.rotation % TETROMINOS[game.currentPiece].length];

            // 힌트 피스 (녹색 반투명)
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#00ff00';
            for (let row = 0; row < hintShape.length; row++) {
                for (let col = 0; col < hintShape[row].length; col++) {
                    if (hintShape[row][col]) {
                        ctx.fillRect(
                            (game.hintPosition.x + col) * BLOCK_SIZE,
                            (game.hintPosition.y + row) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE
                        );
                        ctx.strokeStyle = '#00ff00';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(
                            (game.hintPosition.x + col) * BLOCK_SIZE,
                            (game.hintPosition.y + row) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE
                        );
                    }
                }
            }

            // "HINT" 텍스트 표시
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('HINT', canvas.width / 2, 30);
            ctx.restore();
        }

        // 고스트 피스
        const ghostY = getGhostY();
        const shape = getCurrentShape();
        ctx.fillStyle = COLORS.GHOST;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    ctx.fillRect(
                        (game.currentX + col) * BLOCK_SIZE,
                        (ghostY + row) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                }
            }
        }

        // 현재 피스
        ctx.fillStyle = COLORS[game.currentPiece];
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    ctx.fillRect(
                        (game.currentX + col) * BLOCK_SIZE,
                        (game.currentY + row) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                    ctx.strokeStyle = '#000';
                    ctx.strokeRect(
                        (game.currentX + col) * BLOCK_SIZE,
                        (game.currentY + row) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                }
            }
        }
    }

    // 파티클 그리기
    for (const particle of game.particles) {
        particle.draw(ctx);
    }
}

// 피스를 작은 캔버스에 그리기
function drawPieceOnCanvas(context, pieceType, canvasWidth, canvasHeight) {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    if (!pieceType) return;

    const shape = TETROMINOS[pieceType][0];
    const blockSize = Math.min(canvasWidth, canvasHeight) / 5;

    // 피스를 중앙에 배치
    const offsetX = (canvasWidth - blockSize * 4) / 2;
    const offsetY = (canvasHeight - blockSize * 4) / 2;

    context.fillStyle = COLORS[pieceType];
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                context.fillRect(
                    offsetX + col * blockSize,
                    offsetY + row * blockSize,
                    blockSize,
                    blockSize
                );
                context.strokeStyle = '#000';
                context.strokeRect(
                    offsetX + col * blockSize,
                    offsetY + row * blockSize,
                    blockSize,
                    blockSize
                );
            }
        }
    }
}

// 홀드 피스 그리기
function drawHold() {
    // 게임이 시작되지 않았으면 아무것도 그리지 않음
    if (!game.started) {
        holdCtx.fillStyle = '#000';
        holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    } else {
        drawPieceOnCanvas(holdCtx, game.holdPiece, holdCanvas.width, holdCanvas.height);
    }
}

// 다음 피스 그리기
function drawNext() {
    for (let i = 0; i < 3; i++) {
        const canvas = nextCanvases[i];
        const ctx = nextCtxs[i];

        // 게임이 시작되지 않았으면 아무것도 그리지 않음
        if (!game.started) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            drawPieceOnCanvas(ctx, game.nextPieces[i], canvas.width, canvas.height);
        }
    }
}

// 게임 루프
function gameLoop(time = 0) {
    if (!game.started || game.paused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = time - game.lastTime;
    game.lastTime = time;

    // 파티클 업데이트
    game.particles = game.particles.filter(particle => particle.update());

    // 애니메이션 중이 아닐 때만 블록 낙하
    if (!game.animating) {
        game.dropCounter += deltaTime;

        if (game.dropCounter > game.dropInterval) {
            softDrop();
            game.dropCounter = 0;
        }
    }

    drawBoard();

    // 게임이 시작된 경우에만 NEXT 그리기
    if (game.started) {
        drawNext();
    }

    requestAnimationFrame(gameLoop);
}

// 키보드 입력
document.addEventListener('keydown', (e) => {
    if (!game.started) {
        if (e.code === 'Space') {
            startGame();
        }
        return;
    }

    if (game.gameOver && e.code === 'Space') {
        resetGame();
        startGame();
        return;
    }

    if (game.paused) {
        if (e.code === 'KeyP' || e.code === 'Escape') {
            togglePause();
        } else if (e.code === 'KeyR') {
            game.paused = false;
            resetGame();
            startGame();
        }
        return;
    }

    // 애니메이션 중에는 입력 무시
    if (game.animating) {
        return;
    }

    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            move(-1);
            break;
        case 'ArrowRight':
        case 'KeyD':
            move(1);
            break;
        case 'ArrowUp':
        case 'KeyW':
            rotate();
            break;
        case 'ArrowDown':
        case 'KeyS':
            softDrop();
            game.dropCounter = 0;
            break;
        case 'Space':
            e.preventDefault();
            hardDrop();
            game.dropCounter = 0;
            break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
            hold();
            break;
        case 'KeyH':
            showHint();
            break;
        case 'KeyP':
        case 'Escape':
            togglePause();
            break;
    }

    drawBoard();
});

// 일시정지 토글
function togglePause() {
    game.paused = !game.paused;
    if (game.paused) {
        showOverlay('PAUSED', 'Press P or ESC to continue\nPress R to restart', [
            {
                text: 'Continue (P)',
                primary: true,
                onClick: () => {
                    togglePause();
                }
            },
            {
                text: 'Restart (R)',
                primary: false,
                onClick: () => {
                    game.paused = false;
                    resetGame();
                    startGame();
                }
            }
        ]);
    } else {
        hideOverlay();
    }
}

// 게임 시작
function startGame() {
    game.started = true;
    game.paused = false;
    hideOverlay();

    // 게임 시작 시 NEXT와 HOLD 영역 업데이트
    drawNext();
    drawHold();

    gameLoop();
}

// 게임 리셋
function resetGame() {
    initBoard();
    initNextPieces();
    newPiece();

    game.score = 0;
    game.level = 1;
    game.lines = 0;
    game.gameOver = false;
    game.paused = false;
    game.started = false;
    game.dropCounter = 0;
    game.dropInterval = 1000;
    game.lastTime = 0;
    game.holdPiece = null;
    game.canHold = true;
    game.animating = false;
    game.particles = [];
    game.hintsRemaining = 5;
    game.showingHint = false;
    game.hintPosition = null;

    updateUI();
    drawHold();
    drawNext();
}

// 초기화
function init() {
    resetGame();

    // 초기 화면에서는 빈 캔버스 표시
    drawNext();
    drawHold();
    drawBoard();

    showOverlay('TETRIS', 'Press SPACE to start');
    requestAnimationFrame(gameLoop);
}

init();
