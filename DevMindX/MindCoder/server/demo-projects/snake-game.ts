// Demo Snake Game Project - Hardcoded for testing all DevMindX features
// This project works smoothly with: Architecture Generator, Learning Mode, Preview, etc.

export const snakeGameProject = {
  name: "Classic Snake Game",
  framework: "web",
  description: "A classic snake game built with HTML5 Canvas, JavaScript, and CSS. Features include score tracking, game over detection, and smooth animations. Perfect for demonstrating DevMindX capabilities.",
  
  files: {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classic Snake Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <h1>🐍 Classic Snake Game</h1>
        <div class="score-board">
            <div class="score">Score: <span id="score">0</span></div>
            <div class="high-score">High Score: <span id="highScore">0</span></div>
        </div>
        <canvas id="gameCanvas" width="400" height="400"></canvas>
        <div class="controls">
            <p>Use Arrow Keys to Control</p>
            <button id="startBtn">Start Game</button>
            <button id="pauseBtn">Pause</button>
            <button id="resetBtn">Reset</button>
        </div>
        <div id="gameOver" class="game-over hidden">
            <h2>Game Over!</h2>
            <p>Your Score: <span id="finalScore">0</span></p>
            <button id="restartBtn">Play Again</button>
        </div>
    </div>
    <script src="game.js"></script>
</body>
</html>`,

    "style.css": `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}

.game-container {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 500px;
    width: 100%;
}

h1 {
    color: #667eea;
    margin-bottom: 20px;
    font-size: 2em;
}

.score-board {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    padding: 15px;
    background: #f7f7f7;
    border-radius: 10px;
}

.score, .high-score {
    font-size: 1.2em;
    font-weight: bold;
    color: #333;
}

.score span, .high-score span {
    color: #667eea;
}

#gameCanvas {
    border: 3px solid #667eea;
    border-radius: 10px;
    background: #000;
    display: block;
    margin: 0 auto;
}

.controls {
    margin-top: 20px;
}

.controls p {
    margin-bottom: 15px;
    color: #666;
    font-size: 0.9em;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    margin: 5px;
    border-radius: 8px;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button:active {
    transform: translateY(0);
}

.game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 10;
}

.game-over.hidden {
    display: none;
}

.game-over h2 {
    color: #e74c3c;
    margin-bottom: 15px;
}

.game-over p {
    font-size: 1.3em;
    margin-bottom: 20px;
    color: #333;
}

#finalScore {
    color: #667eea;
    font-weight: bold;
}`,

    "game.js": `// Snake Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverDiv = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const restartBtn = document.getElementById('restartBtn');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 100;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let gameStarted = false;

// Initialize
highScoreElement.textContent = highScore;

// Game functions
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    });
    
    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
        food.x * GRID_SIZE,
        food.y * GRID_SIZE,
        GRID_SIZE - 2,
        GRID_SIZE - 2
    );
}

function moveSnake() {
    if (dx === 0 && dy === 0) return;
    
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        endGame();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    
    // Ensure food doesn't spawn on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood();
    }
}

function gameUpdate() {
    if (!isPaused) {
        moveSnake();
        drawGame();
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameLoop = setInterval(gameUpdate, GAME_SPEED);
        startBtn.textContent = 'Resume';
    } else if (isPaused) {
        isPaused = false;
        pauseBtn.textContent = 'Pause';
    }
}

function pauseGame() {
    if (gameStarted && !isPaused) {
        isPaused = true;
        pauseBtn.textContent = 'Resume';
    } else if (isPaused) {
        isPaused = false;
        pauseBtn.textContent = 'Pause';
    }
}

function resetGame() {
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    food = { x: 15, y: 15 };
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    isPaused = false;
    gameStarted = false;
    gameOverDiv.classList.add('hidden');
    startBtn.textContent = 'Start Game';
    pauseBtn.textContent = 'Pause';
    drawGame();
}

function endGame() {
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverDiv.classList.remove('hidden');
    gameStarted = false;
}

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
        case ' ':
            pauseGame();
            break;
    }
});

// Initial draw
drawGame();`,

    "README.md": `# 🐍 Classic Snake Game

A modern implementation of the classic Snake game using HTML5 Canvas and vanilla JavaScript.

## Features

- **Smooth Gameplay**: Responsive controls with arrow keys
- **Score Tracking**: Real-time score display with high score persistence
- **Game Controls**: Start, Pause, and Reset functionality
- **Collision Detection**: Wall and self-collision detection
- **Modern UI**: Beautiful gradient design with smooth animations
- **Local Storage**: High score saved across sessions

## How to Play

1. Click "Start Game" to begin
2. Use **Arrow Keys** to control the snake:
   - ⬆️ Up Arrow: Move up
   - ⬇️ Down Arrow: Move down
   - ⬅️ Left Arrow: Move left
   - ➡️ Right Arrow: Move right
3. Eat the red food to grow and increase your score
4. Avoid hitting walls or yourself
5. Press **Space** to pause/resume

## Game Rules

- Each food eaten adds 10 points to your score
- The snake grows longer with each food consumed
- Game ends if you hit a wall or your own body
- High score is automatically saved

## Technical Details

### Architecture

\`\`\`
┌─────────────────────────────────────┐
│         index.html (UI)             │
│  - Canvas element                   │
│  - Score display                    │
│  - Control buttons                  │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│       game.js (Logic)               │
│  - Game loop                        │
│  - Snake movement                   │
│  - Collision detection              │
│  - Score management                 │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│      style.css (Styling)            │
│  - Responsive design                │
│  - Animations                       │
│  - Modern UI                        │
└─────────────────────────────────────┘
\`\`\`

### Code Structure

- **index.html**: Main HTML structure with canvas and UI elements
- **game.js**: Core game logic including:
  - Snake movement and growth
  - Food generation
  - Collision detection
  - Score tracking
  - Game state management
- **style.css**: Modern styling with:
  - Gradient backgrounds
  - Smooth animations
  - Responsive layout

## Browser Compatibility

Works on all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- CSS3 Flexbox

## Learning Opportunities

This project demonstrates:
- Canvas API usage
- Game loop implementation
- Event handling
- State management
- Local storage
- Collision detection algorithms
- Array manipulation

## Future Enhancements

Potential improvements:
- Multiple difficulty levels
- Power-ups and special items
- Sound effects
- Mobile touch controls
- Leaderboard system
- Different game modes

---

**Built with DevMindX** - AI-Powered Development Platform

Perfect for learning game development, JavaScript, and Canvas API!`
  }
};

// Architecture diagram for the snake game
export const snakeGameArchitecture = {
  description: "Classic Snake Game Architecture",
  components: [
    {
      name: "User Interface Layer",
      type: "frontend",
      description: "HTML5 Canvas-based game interface with controls",
      technologies: ["HTML5", "CSS3", "Canvas API"],
      responsibilities: [
        "Render game graphics",
        "Display score and controls",
        "Handle user input"
      ]
    },
    {
      name: "Game Logic Layer",
      type: "logic",
      description: "Core game mechanics and state management",
      technologies: ["JavaScript ES6"],
      responsibilities: [
        "Snake movement and growth",
        "Collision detection",
        "Food generation",
        "Score calculation",
        "Game state management"
      ]
    },
    {
      name: "Storage Layer",
      type: "storage",
      description: "Persistent data storage",
      technologies: ["LocalStorage API"],
      responsibilities: [
        "Save high scores",
        "Persist game settings"
      ]
    }
  ],
  dataFlow: [
    "User Input → Event Handlers → Game Logic",
    "Game Logic → Canvas Rendering → Display",
    "Score Updates → LocalStorage → Persistence"
  ],
  patterns: [
    "Game Loop Pattern",
    "State Management",
    "Event-Driven Architecture"
  ]
};

// Learning mode content for snake game
export const snakeGameLearning = {
  concepts: [
    {
      title: "HTML5 Canvas",
      difficulty: "beginner",
      description: "Learn how to use Canvas API for 2D graphics rendering",
      examples: [
        "Drawing rectangles for snake and food",
        "Clearing and updating canvas",
        "Coordinate system and grid layout"
      ]
    },
    {
      title: "Game Loop",
      difficulty: "intermediate",
      description: "Understanding the game loop pattern for continuous updates",
      examples: [
        "Using setInterval for game updates",
        "Frame-based animation",
        "Game state management"
      ]
    },
    {
      title: "Collision Detection",
      difficulty: "intermediate",
      description: "Implementing collision detection algorithms",
      examples: [
        "Wall collision checking",
        "Self-collision detection",
        "Food collision and consumption"
      ]
    },
    {
      title: "Event Handling",
      difficulty: "beginner",
      description: "Handling keyboard input for game controls",
      examples: [
        "Arrow key detection",
        "Preventing invalid moves",
        "Pause/resume functionality"
      ]
    },
    {
      title: "Data Persistence",
      difficulty: "beginner",
      description: "Using LocalStorage for saving game data",
      examples: [
        "Saving high scores",
        "Retrieving stored data",
        "Handling storage errors"
      ]
    }
  ],
  challenges: [
    {
      title: "Add Speed Levels",
      difficulty: "easy",
      description: "Implement difficulty levels that increase game speed",
      hints: ["Modify GAME_SPEED constant", "Add level selection UI"]
    },
    {
      title: "Add Sound Effects",
      difficulty: "medium",
      description: "Add audio feedback for eating food and game over",
      hints: ["Use Web Audio API", "Create sound effect files"]
    },
    {
      title: "Implement Power-ups",
      difficulty: "hard",
      description: "Add special items that give temporary abilities",
      hints: ["Create new item types", "Add timer system", "Modify game logic"]
    }
  ]
};
