import { connectToMongoDB } from "./server/db";

async function createDemoProject() {
  try {
    const mongoDb = await connectToMongoDB();
    const projectsCollection = mongoDb.collection('projects');
    
    console.log("🗑️  Clearing existing projects...");
    
    // Delete all existing projects
    const deleteResult = await projectsCollection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing projects`);

    console.log("\n🎮 Creating Snake Game demo project...");
    
    // Create Snake Game project
    const snakeGameFiles = {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Game - DevMindX Demo</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>🐍 Snake Game</h1>
        <div class="game-info">
            <div class="score">Score: <span id="score">0</span></div>
            <div class="high-score">High Score: <span id="highScore">0</span></div>
        </div>
        <canvas id="gameCanvas" width="400" height="400"></canvas>
        <div class="controls">
            <button id="startBtn" class="btn btn-primary">Start Game</button>
            <button id="pauseBtn" class="btn btn-secondary" disabled>Pause</button>
            <button id="resetBtn" class="btn btn-danger">Reset</button>
        </div>
        <div class="instructions">
            <h3>How to Play:</h3>
            <ul>
                <li>Use Arrow Keys to control the snake</li>
                <li>Eat the red food to grow</li>
                <li>Don't hit the walls or yourself!</li>
            </ul>
        </div>
        <div class="difficulty">
            <label>Difficulty:</label>
            <select id="difficulty">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>
    </div>
    <script src="game.js"></script>
</body>
</html>`,
      
      "styles.css": `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #667eea;
    margin-bottom: 20px;
    font-size: 2.5em;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.game-info {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    font-size: 1.2em;
    font-weight: bold;
}

.score, .high-score {
    color: #333;
}

.score span, .high-score span {
    color: #667eea;
}

#gameCanvas {
    border: 3px solid #667eea;
    border-radius: 10px;
    background: #f0f0f0;
    display: block;
    margin: 0 auto 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 20px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:active {
    transform: translateY(0);
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.instructions {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 15px;
    text-align: left;
}

.instructions h3 {
    color: #667eea;
    margin-bottom: 10px;
}

.instructions ul {
    list-style-position: inside;
    color: #555;
}

.instructions li {
    margin: 5px 0;
}

.difficulty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-weight: bold;
}

.difficulty select {
    padding: 8px 15px;
    border: 2px solid #667eea;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    background: white;
}

@media (max-width: 500px) {
    .container {
        padding: 20px;
    }
    
    h1 {
        font-size: 2em;
    }
    
    #gameCanvas {
        width: 100%;
        height: auto;
    }
    
    .controls {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
}`,
      
      "game.js": `// Game Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');

// Game Constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Game State
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let gameSpeed = 100;

// Initialize
highScoreElement.textContent = highScore;

// Difficulty Settings
const difficulties = {
    easy: 150,
    medium: 100,
    hard: 50
};

difficultySelect.addEventListener('change', (e) => {
    gameSpeed = difficulties[e.target.value];
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = setInterval(update, gameSpeed);
    }
});

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', changeDirection);

function startGame() {
    if (!gameLoop) {
        gameLoop = setInterval(update, gameSpeed);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        if (dx === 0 && dy === 0) {
            dx = 1; // Start moving right
        }
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function resetGame() {
    clearInterval(gameLoop);
    gameLoop = null;
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    isPaused = false;
    updateScore();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    drawGame();
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function update() {
    if (isPaused) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        food = generateFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#667eea' : '#764ba2';
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // Add shine effect to head
        if (index === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(
                segment.x * GRID_SIZE + 2,
                segment.y * GRID_SIZE + 2,
                GRID_SIZE / 2,
                GRID_SIZE / 2
            );
        }
    });

    // Draw food
    ctx.fillStyle = '#dc3545';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function updateScore() {
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(\`Score: \${score}\`, canvas.width / 2, canvas.height / 2 + 20);
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
}

// Initial draw
drawGame();`
    };

    // Get first user ID from database
    const usersCollection = mongoDb.collection('users');
    const firstUser = await usersCollection.findOne({});
    
    if (!firstUser) {
      console.error("❌ No users found in database. Please create a user first.");
      process.exit(1);
    }

    const newProject = {
      name: "Snake Game",
      description: "A classic Snake game built with HTML5 Canvas. Features include score tracking, difficulty levels, and smooth animations. Perfect demo for DevMindX!",
      framework: "html",
      userId: firstUser._id,
      files: snakeGameFiles,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await projectsCollection.insertOne(newProject);

    console.log("✅ Snake Game project created successfully!");
    console.log("\n📋 Project Details:");
    console.log(`   ID: ${insertResult.insertedId}`);
    console.log(`   Name: ${newProject.name}`);
    console.log(`   Framework: ${newProject.framework}`);
    console.log(`   User ID: ${firstUser._id}`);
    console.log(`   Files: ${Object.keys(snakeGameFiles).join(', ')}`);
    
    console.log("\n🎯 Features to demonstrate:");
    console.log("   ✓ AI Code Generation (already generated)");
    console.log("   ✓ Code Editor (Monaco editor with syntax highlighting)");
    console.log("   ✓ Live Preview (instant preview of the game)");
    console.log("   ✓ File Management (HTML, CSS, JS files)");
    console.log("   ✓ Project Management (save, load, update)");
    console.log("   ✓ Real-time Collaboration (if multiple users)");
    console.log("   ✓ Terminal Integration");
    console.log("   ✓ AI Chat Assistant");
    
    console.log("\n🚀 Ready to demo! Open the project in DevMindX IDE.");
    console.log(`\n📝 To view: Navigate to /projects and click on "Snake Game"`);
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createDemoProject();
