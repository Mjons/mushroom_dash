// Mushroom Dash - Simplified Version

// Canvas and context
let canvas;
let ctx;

// Game state
let gameActive = false;
let startTime = 0;
let frameId = 0;
let selectedCharacter = null;
let selectedEnvironment = localStorage.getItem('mushroom-dash-environment') || 'random';
let currentEnvironment = 'forest';

// Player
const player = {
  x: 120,
  y: 0,
  width: 60,
  height: 80,
  vy: 0,
  jumping: false
};
const groundY = 380;

// Objects
const obstacles = [];
const collectibles = [];

// Assets
const assets = {
  backgrounds: {
    forest: [new Image(), new Image(), new Image()],
    kitchen: [new Image(), new Image(), new Image()]
  },
  obstacle: new Image(),
  collectible: new Image()
};

const SCORE_PER_COLLECTIBLE = 10;

let scoreManager;

function loadAssets() {
  assets.backgrounds.forest[0].src = 'backgrounds/background_forest_layer1.png';
  assets.backgrounds.forest[1].src = 'backgrounds/background_forest_layer2.png';
  assets.backgrounds.forest[2].src = 'backgrounds/background_forest_layer3.png';
  assets.backgrounds.kitchen[0].src = 'backgrounds/background_kitchen_layer1.png';
  assets.backgrounds.kitchen[1].src = 'backgrounds/background_kitchen_layer2.png';
  assets.backgrounds.kitchen[2].src = 'backgrounds/background_kitchen_layer3.png';
  assets.obstacle.src = 'obstacles/obstacle_sugar_cube.png';
  assets.collectible.src = 'collectibles/collectible_chocolate_icon.png';
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function setupUI() {
  const envSelect = document.getElementById('environment-selector');
  if (envSelect) {
    envSelect.value = selectedEnvironment;
    envSelect.addEventListener('change', () => {
      selectedEnvironment = envSelect.value;
      localStorage.setItem('mushroom-dash-environment', selectedEnvironment);
    });
  }

  const highScoreEl = document.getElementById('high-score');
  if (highScoreEl) {
    highScoreEl.textContent = scoreManager.getHighScore();
  }

  document.querySelectorAll('.character').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.character').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      selectedCharacter = el.getAttribute('data-character');
      document.getElementById('start-button').disabled = false;
    });
  });

  document.getElementById('start-button').addEventListener('click', startGame);
}

function startGame() {
  currentEnvironment = selectedEnvironment === 'random'
    ? (Math.random() < 0.5 ? 'forest' : 'kitchen')
    : selectedEnvironment;

  player.y = groundY;
  player.jumping = false;
  player.vy = 0;
  obstacles.length = 0;
  collectibles.length = 0;
  scoreManager.resetScore();

  showScreen('screen-gameplay');
  gameActive = true;
  startTime = performance.now();
  frameId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameActive = false;
  cancelAnimationFrame(frameId);

  const finalScore = scoreManager.getFinalScore();
  document.getElementById('final-score').textContent = finalScore.score;
  document.getElementById('high-score').textContent = finalScore.highScore;

  showScreen('screen-game-end');
}

function gameLoop(timestamp) {
  const elapsed = timestamp - startTime;
  const delta = timestamp - (gameLoop.last || timestamp);
  gameLoop.last = timestamp;

  update(delta / 1000);
  draw();

  const remaining = Math.max(0, GAME_CONFIG.gameDuration - elapsed);
  document.querySelector('.timer-bar').style.width = `${(remaining / GAME_CONFIG.gameDuration) * 100}%`;
  document.getElementById('current-score').textContent = scoreManager.currentScore;

  if (elapsed >= GAME_CONFIG.gameDuration) {
    endGame();
    return;
  }

  frameId = requestAnimationFrame(gameLoop);
}

function update(dt) {
  // spawn obstacles and collectibles
  if (Math.random() < 0.02) {
    obstacles.push({ x: canvas.width, y: groundY, width: 40, height: 40 });
  }
  if (Math.random() < 0.03) {
    collectibles.push({ x: canvas.width, y: groundY - 30, width: 30, height: 30 });
  }

  // move objects
  obstacles.forEach(o => o.x -= 6);
  collectibles.forEach(c => c.x -= 6);

  // player physics
  if (player.jumping) {
    player.vy += 0.5;
    player.y += player.vy;
    if (player.y >= groundY) {
      player.y = groundY;
      player.jumping = false;
    }
  }

  // collisions
  obstacles.forEach((o, i) => {
    if (checkCollision(player, o)) {
      endGame();
    }
  });

  for (let i = collectibles.length - 1; i >= 0; i--) {
    if (checkCollision(player, collectibles[i])) {
      collectibles.splice(i, 1);
      scoreManager.addPoints('chocolate');
    }
  }

  // clean up off-screen
  while (obstacles.length && obstacles[0].x + obstacles[0].width < 0) {
    obstacles.shift();
  }
  while (collectibles.length && collectibles[0].x + collectibles[0].width < 0) {
    collectibles.shift();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  // draw player
  ctx.fillStyle = '#ff6666';
  ctx.fillRect(player.x, player.y - player.height, player.width, player.height);

  // draw obstacles
  obstacles.forEach(o => ctx.drawImage(assets.obstacle, o.x, o.y - o.height, o.width, o.height));

  // draw collectibles
  collectibles.forEach(c => ctx.drawImage(assets.collectible, c.x, c.y - c.height, c.width, c.height));
}

function drawBackground() {
  const layers = assets.backgrounds[currentEnvironment];
  layers.forEach((img, idx) => {
    const speed = (idx + 1) * 0.5;
    const x = -((Date.now() * speed / 50) % canvas.width);
    ctx.drawImage(img, x, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x + canvas.width, 0, canvas.width, canvas.height);
  });
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y - a.height < b.y &&
    a.y > b.y - b.height
  );
}

function showScreen(id) {
  document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function handleJump() {
  if (!gameActive) return;
  if (!player.jumping) {
    player.jumping = true;
    player.vy = -12;
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') handleJump();
});

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  scoreManager = new ScoreManager();

  loadAssets();
  setupUI();
  showScreen('screen-title');
});
