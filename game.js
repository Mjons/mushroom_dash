// Mushroom Dash Game - Main Game Logic
// This file contains the core game functionality

// Global Variables
let canvas;
let ctx;
let gameActive = false;
let selectedCharacter = null;
let selectedEnvironment = 'random';
let gameTimer;
let animationFrame;
let lastTimestamp = 0;
let gameTime = 0;
const GAME_DURATION = GAME_CONFIG.gameDuration; // 45 seconds
let isPaused = false;
let debugMode = false; // Debug mode to visualize hitboxes

// Performance optimization
let performanceMode = 'auto'; // auto, high, medium, low
let fpsHistory = []; // Keep track of recent FPS values
const FPS_HISTORY_LENGTH = 10; // How many FPS readings to keep
const LOW_FPS_THRESHOLD = 25; // FPS below this will trigger low performance mode
const HIGH_FPS_THRESHOLD = 45; // FPS above this will enable high performance mode

// Audio System
let musicEnabled = true;
let sfxEnabled = true;
let backgroundMusic = null;
const audioAssets = {
    music: {
        background: null
    },
    sfx: {
        jump: null,
        collectItem: null,
        collectChocolate: null,
        hitObstacle: null,
        powerUp: null,
        gameOver: null
    }
};

// Game Assets
const assets = {
    backgrounds: {
        forest: {
            layer1: null,
            layer2: null,
            layer3: null
        },
        kitchen: {
            layer1: null,
            layer2: null,
            layer3: null
        }
    },
    sprites: {
        leo: {
            idle: null,
            running: null,
            jumping: null,
            hurt: null,
            celebration: null
        },
        remi: {
            idle: null,
            running: null,
            jumping: null,
            hurt: null,
            celebration: null
        },
        spora: {
            idle: null,
            running: null,
            jumping: null,
            hurt: null,
            celebration: null
        }
    },
    collectibles: {
        brain: null,
        heart: null,
        energy: null,
        chocolate: null
    },
    obstacles: {
        sugarCube: null,
        sodaCan: null,
        coffeeCup: null
    },
    ui: {
        leaderboard: null,
        shareFlow: null
    }
};

// Game State
const gameState = {
    player: {
        x: 100,
        y: 450,
        width: 240,
        height: 300,
        velocityY: 0,
        isJumping: false,
        lane: 1, // 0 = top, 1 = middle, 2 = bottom
        animState: 'running',
        frameX: 0,
        frameY: 0,
        frameCount: 0,
        frameDelay: 5,
        invulnerable: false
    },
    lanes: [
        { y: 350 }, // Top lane
        { y: 450 }, // Middle lane
        { y: 550 }  // Bottom lane
    ],
    background: {
        x: 0,
        speed: 5
    },
    environment: 'forest',
    collectibles: [],
    obstacles: [],
    powerUp: {
        active: false,
        type: null,
        timeLeft: 0
    },
    ui: {
        score: 0,
        combo: 0,
        maxCombo: 10, // When this is reached, power-up activates
    },
    // Add diagnostics to track missed assets
    diagnostics: {
        missingAssets: [],
        collisionIssues: 0,
        lastFrameRate: 0,
        lastError: null
    }
};

// Game Management
const game = {
    init: function() {
        // Setup canvas
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);

        // Initialize score manager
        this.scoreManager = new ScoreManager();
        this.leaderboardManager = new LeaderboardManager();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Set up global error handling
        this.setupErrorHandling();
        
        // Load assets
        this.loadAssets();
        
        // Initialize audio system
        this.initAudio();
        
        // Initialize performance mode
        const savedPerformanceMode = localStorage.getItem('mushroom-dash-performance');
        if (savedPerformanceMode) {
            performanceMode = savedPerformanceMode;
            this.setPerformanceMode(performanceMode);
        }
    },

    resizeCanvas: function() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    },

    setupEventListeners: function() {
        // Character selection
        const characters = document.querySelectorAll('.character');
        characters.forEach(char => {
            char.addEventListener('click', () => {
                characters.forEach(c => c.classList.remove('selected'));
                char.classList.add('selected');
                selectedCharacter = char.getAttribute('data-character');
                document.getElementById('start-button').disabled = false;
            });
        });

        // Debug toggle
        const debugToggle = document.getElementById('debug-toggle');
        debugToggle.addEventListener('change', (e) => {
            debugMode = e.target.checked;
            console.log("Debug mode " + (debugMode ? "enabled" : "disabled"));
            
            // Save preference to localStorage
            localStorage.setItem('mushroom-dash-debug', debugMode ? 'true' : 'false');
        });
        
        // Check if debug mode was previously enabled
        if (localStorage.getItem('mushroom-dash-debug') === 'true') {
            debugToggle.checked = true;
            debugMode = true;
        }

        // Performance selector
        const performanceSelector = document.getElementById('performance-selector');
        performanceSelector.addEventListener('change', (e) => {
            this.changePerformanceMode(e.target.value);
        });

        // Environment selector
        const environmentSelector = document.getElementById('environment-selector');
        if (environmentSelector) {
            environmentSelector.addEventListener('change', (e) => {
                selectedEnvironment = e.target.value;
                localStorage.setItem('mushroom-dash-environment', selectedEnvironment);
            });

            // Load saved preference
            const savedEnv = localStorage.getItem('mushroom-dash-environment');
            if (savedEnv) {
                selectedEnvironment = savedEnv;
                environmentSelector.value = savedEnv;
            }
        }
        
        // Check if performance mode was previously set
        const savedPerformanceMode = localStorage.getItem('mushroom-dash-performance');
        if (savedPerformanceMode) {
            performanceSelector.value = savedPerformanceMode;
            this.changePerformanceMode(savedPerformanceMode);
        }

        // Game controls
        document.addEventListener('keydown', (e) => {
            if (!gameActive) return;
            
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                this.jump();
            } else if (e.code === 'ArrowDown') {
                this.moveDown();
            } else if (e.code === 'ArrowLeft') {
                this.moveUp();
            } else if (e.code === 'ArrowRight') {
                this.moveDown();
            } else if (e.code === 'Escape') {
                this.togglePause();
            } else if (e.code === 'KeyD') {
                // Toggle debug mode with 'D' key
                debugMode = !debugMode;
                // Update the checkbox
                document.getElementById('debug-toggle').checked = debugMode;
                console.log("Debug mode " + (debugMode ? "enabled" : "disabled"));
                // Save preference to localStorage
                localStorage.setItem('mushroom-dash-debug', debugMode ? 'true' : 'false');
            }
        });

        // Touch controls
        canvas.addEventListener('touchstart', (e) => {
            if (!gameActive) return;
            e.preventDefault();
            this.jump();
        });
        
        // Swipe controls for mobile
        let touchStartY = 0;
        let touchStartX = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            if (!gameActive) return;
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (!gameActive) return;
            e.preventDefault();
        });
        
        canvas.addEventListener('touchend', (e) => {
            if (!gameActive) return;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            
            const deltaY = touchEndY - touchStartY;
            const deltaX = touchEndX - touchStartX;
            
            // Detect vertical swipe (if vertical difference is greater than horizontal)
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
                if (deltaY < 0) {
                    // Swipe up - move to upper lane
                    this.moveUp();
                } else {
                    // Swipe down - move to lower lane
                    this.moveDown();
                }
            }
        });

        // Button listeners
        document.getElementById('start-button').addEventListener('click', () => {
            if (selectedCharacter) {
                this.startGame();
            }
        });

        document.getElementById('pause-button').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('play-again-button').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('screen-title');
        });

        document.getElementById('share-button').addEventListener('click', () => {
            this.prepareShareScreen();
            this.showScreen('screen-share');
        });

        document.getElementById('contest-button').addEventListener('click', () => {
            this.showScreen('screen-contest');
        });

        document.getElementById('share-return').addEventListener('click', () => {
            this.showScreen('screen-game-end');
        });

        // Share buttons
        document.getElementById('share-instagram').addEventListener('click', () => {
            new SocialShare(this.scoreManager).shareToInstagram();
        });

        document.getElementById('share-tiktok').addEventListener('click', () => {
            new SocialShare(this.scoreManager).shareToTikTok();
        });

        document.getElementById('share-twitter').addEventListener('click', () => {
            new SocialShare(this.scoreManager).shareToTwitter();
        });

        document.getElementById('share-copy-link').addEventListener('click', () => {
            new SocialShare(this.scoreManager).copyShareLink();
        });

        // Contest form
        const contestForm = document.getElementById('contest-form');
        new ContestForm(contestForm);
        
        // Audio controls
        document.getElementById('music-toggle').addEventListener('click', () => {
            this.toggleMusic();
        });
        
        document.getElementById('sfx-toggle').addEventListener('click', () => {
            this.toggleSFX();
        });
        
        document.getElementById('music-toggle-pause').addEventListener('click', () => {
            this.toggleMusic();
        });
        
        document.getElementById('sfx-toggle-pause').addEventListener('click', () => {
            this.toggleSFX();
        });
        
        // Pause menu controls
        document.getElementById('resume-button').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        document.getElementById('exit-button').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('screen-title');
        });
    },

    loadAssets: function() {
        // Count total assets to load
        const totalAssets = this.countTotalAssets();
        window.loadedAssets = 0;
        
        // Set a timeout to prevent infinite loading
        const maxLoadingTime = 30000; // 30 seconds maximum loading time (increased from 15s)
        const loadingTimeout = setTimeout(() => {
            console.warn('Loading assets timed out, proceeding anyway');
            // Record which assets failed to load
            this.checkMissingAssets();
            this.showScreen('screen-title');
        }, maxLoadingTime);
        
        // Update loading bar
        const updateProgress = () => {
            window.loadedAssets++;
            const percentage = Math.floor((window.loadedAssets / totalAssets) * 100);
            document.querySelector('.loading-progress').style.width = `${percentage}%`;
            document.getElementById('loading-percentage').textContent = `${percentage}%`;
            
            // Add loading tips to keep user informed
            this.updateLoadingTips(percentage);
            
            // If all assets except audio are loaded, show title screen and clear timeout
            if (window.loadedAssets >= totalAssets) {
                clearTimeout(loadingTimeout);
                setTimeout(() => {
                    // Check if any assets are missing before proceeding
                    this.checkMissingAssets();
                    this.showScreen('screen-title');
                }, 500);
            } else if (window.loadedAssets >= totalAssets * 0.7) {
                // If 70% of assets are loaded after a delay, proceed anyway
                // This helps with slow connections where some assets might take very long
                setTimeout(() => {
                    clearTimeout(loadingTimeout);
                    this.checkMissingAssets();
                    this.showScreen('screen-title');
                }, 5000); // Wait 5 seconds after reaching 70%
            }
        };
        
        // Error handler for asset loading
        const handleLoadError = (assetType, assetName) => {
            console.error(`Failed to load ${assetType}: ${assetName}`);
            // Add to diagnostics list
            gameState.diagnostics.missingAssets.push(`${assetType}: ${assetName}`);
            updateProgress(); // Count error as loaded to prevent getting stuck
        };
        
        // Load background images - use safe loading with fallbacks
        this.loadImageSafely('backgrounds.forest.layer1', 'backgrounds/background_forest_layer1.png', updateProgress, handleLoadError);
        this.loadImageSafely('backgrounds.forest.layer3', 'backgrounds/background_forest_layer3.png', updateProgress, handleLoadError);
        
        // Create a canvas-based fallback for layer2 since the file is missing
        const createFallbackLayer2 = () => {
            const fallbackCanvas = document.createElement('canvas');
            fallbackCanvas.width = 1024;
            fallbackCanvas.height = 512;
            const ctx = fallbackCanvas.getContext('2d');
            
            // Create a green gradient for the middle layer
            const gradient = ctx.createLinearGradient(0, 0, 0, fallbackCanvas.height);
            gradient.addColorStop(0, '#87CEEB80'); // Semi-transparent sky
            gradient.addColorStop(1, '#2E8B57');   // Forest green
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
            
            // Draw some trees
            for (let i = 0; i < 15; i++) {
                const x = i * (fallbackCanvas.width / 15);
                const width = fallbackCanvas.width / 15;
                const height = 150 + Math.random() * 100;
                
                // Tree trunk
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + width/3, fallbackCanvas.height - height/2, width/3, height/2);
                
                // Tree canopy
                ctx.fillStyle = '#2E8B57';
                ctx.beginPath();
                ctx.moveTo(x, fallbackCanvas.height - height/2);
                ctx.lineTo(x + width/2, fallbackCanvas.height - height);
                ctx.lineTo(x + width, fallbackCanvas.height - height/2);
                ctx.closePath();
                ctx.fill();
            }
            
            // Set the fallback as the layer2 asset
            assets.backgrounds.forest.layer2 = fallbackCanvas;
            console.log("Created fallback for forest layer 2 background");
            updateProgress();
        };
        
        // Attempt to load layer2, but use fallback if it fails
        const img = new Image();
        img.onload = () => {
            assets.backgrounds.forest.layer2 = img;
            updateProgress();
        };
        img.onerror = () => {
            console.warn("Could not load forest layer 2, using fallback");
            createFallbackLayer2();
        };
        img.src = 'backgrounds/background_forest_layer2.png';
        
        this.loadImageSafely('backgrounds.kitchen.layer1', 'backgrounds/background_kitchen_layer1.png', updateProgress, handleLoadError);
        this.loadImageSafely('backgrounds.kitchen.layer2', 'backgrounds/background_kitchen_layer2.png', updateProgress, handleLoadError);
        this.loadImageSafely('backgrounds.kitchen.layer3', 'backgrounds/background_kitchen_layer3.png', updateProgress, handleLoadError);
        
        // Load sprite sheets with safe loading
        this.loadCharacterSpritesSafely('leo', updateProgress, handleLoadError);
        this.loadCharacterSpritesSafely('remi', updateProgress, handleLoadError);
        this.loadCharacterSpritesSafely('spora', updateProgress, handleLoadError);
        
        // Load collectibles with safe loading
        this.loadImageSafely('collectibles.brain', 'collectibles/collectible_brain_icon.png', updateProgress, handleLoadError);
        this.loadImageSafely('collectibles.heart', 'collectibles/collectible_heart_icon.png', updateProgress, handleLoadError);
        this.loadImageSafely('collectibles.energy', 'collectibles/collectible_energy_icon.png', updateProgress, handleLoadError);
        this.loadImageSafely('collectibles.chocolate', 'collectibles/collectible_chocolate_icon.png', updateProgress, handleLoadError);
        
        // Load obstacles with safe loading
        this.loadImageSafely('obstacles.sugarCube', 'obstacles/obstacle_sugar_cube.png', updateProgress, handleLoadError);
        this.loadImageSafely('obstacles.sodaCan', 'obstacles/obstacle_soda_can.png', updateProgress, handleLoadError);
        this.loadImageSafely('obstacles.coffeeCup', 'obstacles/obstacle_coffee_cup.png', updateProgress, handleLoadError);
        
        // Load UI elements with safe loading
        this.loadImageSafely('ui.leaderboard', 'ui/ui_leaderboard.png', updateProgress, handleLoadError);
        this.loadImageSafely('ui.shareFlow', 'ui/ui_share_flow.png', updateProgress, handleLoadError);
    },
    
    // Method to check if critical assets are missing
    checkMissingAssets: function() {
        if (gameState.diagnostics.missingAssets.length > 0) {
            console.warn(`${gameState.diagnostics.missingAssets.length} assets failed to load:`, 
                        gameState.diagnostics.missingAssets);
            
            // Add a visual warning if critical assets are missing
            const loadingTips = document.querySelector('.loading-tips');
            if (loadingTips) {
                const criticalMissing = gameState.diagnostics.missingAssets.some(asset => 
                    asset.includes('background') || asset.includes('character sprite'));
                
                if (criticalMissing) {
                    loadingTips.innerHTML += `<p class="warning">⚠️ Some important game assets couldn't be loaded. 
                                            The game will still work, but might look different than intended.</p>`;
                } else {
                    loadingTips.innerHTML += `<p class="notice">ℹ️ Some minor assets couldn't be loaded, 
                                            but the game should still work normally.</p>`;
                }
            }
        }
    },
    
    // Method to update loading tips based on progress
    updateLoadingTips: function(percentage) {
        const loadingTips = document.querySelector('.loading-tips');
        
        if (percentage < 25) {
            loadingTips.innerHTML = '<p>Tip: Each character has a unique power-up ability!</p>';
        } else if (percentage < 50) {
            loadingTips.innerHTML = '<p>Tip: Press D during gameplay to enable debug mode.</p>';
        } else if (percentage < 75) {
            loadingTips.innerHTML = '<p>Tip: Collect chocolate bars to increase your combo multiplier!</p>';
        } else {
            loadingTips.innerHTML = '<p>Tip: Avoid obstacles to keep your combo going!</p>';
        }
    },
    
    loadImageSafely: function(key, src, successCallback, errorCallback) {
        const img = new Image();
        
        // Add load event listeners
        img.onload = successCallback;
        img.onerror = () => {
            errorCallback('image', src);
            
            // Create a fallback colored rectangle
            const fallbackImg = document.createElement('canvas');
            fallbackImg.width = 100;
            fallbackImg.height = 100;
            const ctx = fallbackImg.getContext('2d');
            
            // Different colors for different asset types
            let color = '#ff0000'; // Default red
            if (key.includes('background')) color = '#0088ff';
            else if (key.includes('collectible')) color = '#ffcc00';
            else if (key.includes('obstacle')) color = '#ff00ff';
            
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 100, 100);
            
            // Draw asset name on the fallback
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Missing Asset', 50, 50);
            ctx.fillText(src.split('/').pop(), 50, 65);
            
            // Set the image in the assets object to the fallback
            const parts = key.split('.');
            let current = assets;
            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = fallbackImg;
        };
        
        // Set a timeout for this specific image load
        const loadTimeout = setTimeout(() => {
            console.warn(`Loading timed out for image: ${src}`);
            img.src = ''; // Cancel current load
            if (img.onerror) img.onerror(); // Trigger error handler
        }, 5000); // 5 second timeout per image
        
        // Clear timeout on success
        const originalOnload = img.onload;
        img.onload = function() {
            clearTimeout(loadTimeout);
            originalOnload();
        };
        
        // Start loading
        img.src = src;
        
        // Set the image in the assets object
        const parts = key.split('.');
        let current = assets;
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = img;
    },

    loadCharacterSpritesSafely: function(character, successCallback, errorCallback) {
        const types = ['idle', 'running', 'jumping', 'hurt', 'celebration'];
        
        types.forEach(type => {
            const src = `sprites/${character}_${type}.png`;
            this.loadImageSafely(`sprites.${character}.${type}`, src, successCallback, errorCallback);
        });
    },
    
    countTotalAssets: function() {
        // Calculate total number of assets to load
        const bgCount = 6; // 3 forest + 3 kitchen
        const spriteCount = 15; // 3 characters × 5 animations
        const collectibleCount = 4;
        const obstacleCount = 3;
        const uiCount = 2;
        
        return bgCount + spriteCount + collectibleCount + obstacleCount + uiCount;
    },

    initAudio: function() {
        // Calculate audio files to load
        const totalAudio = 7; // background music + 6 sound effects
        let loadedAudio = 0;
        const totalAssets = this.countTotalAssets();
        
        const onAudioLoad = () => {
            loadedAudio++;
            const percentage = Math.floor(((window.loadedAssets + loadedAudio) / (totalAssets + totalAudio)) * 100);
            document.querySelector('.loading-progress').style.width = `${percentage}%`;
            document.getElementById('loading-percentage').textContent = `${percentage}%`;
            
            // Show title screen when all assets are loaded
            if (window.loadedAssets === totalAssets && loadedAudio === totalAudio) {
                setTimeout(() => {
                    this.showScreen('screen-title');
                }, 500);
            }
        };
        
        // Create audio elements
        audioAssets.music.background = new Audio();
        audioAssets.music.background.addEventListener('canplaythrough', onAudioLoad, { once: true });
        audioAssets.music.background.addEventListener('error', onAudioLoad, { once: true });
        audioAssets.music.background.loop = true;
        audioAssets.music.background.volume = 0.5;
        audioAssets.music.background.src = 'audio/background_music.mp3';
        
        // Load sound effects
        const sfxFiles = ['jump', 'collectItem', 'collectChocolate', 'hitObstacle', 'powerUp', 'gameOver'];
        sfxFiles.forEach(sfx => {
            audioAssets.sfx[sfx] = new Audio();
            audioAssets.sfx[sfx].addEventListener('canplaythrough', onAudioLoad, { once: true });
            audioAssets.sfx[sfx].addEventListener('error', onAudioLoad, { once: true });
            audioAssets.sfx[sfx].src = `audio/${sfx.replace(/([A-Z])/g, '_$1').toLowerCase()}.mp3`;
        });
        
        // Set volumes
        audioAssets.sfx.jump.volume = 0.6;
        audioAssets.sfx.collectItem.volume = 0.7;
        audioAssets.sfx.collectChocolate.volume = 0.8;
        audioAssets.sfx.hitObstacle.volume = 0.7;
        audioAssets.sfx.powerUp.volume = 0.8;
        audioAssets.sfx.gameOver.volume = 0.7;
        
        // Initialize button states
        this.updateAudioButtons();
    },
    
    toggleMusic: function() {
        musicEnabled = !musicEnabled;
        
        if (musicEnabled) {
            if (gameActive && !isPaused) {
                audioAssets.music.background.play();
            }
        } else {
            audioAssets.music.background.pause();
        }
        
        this.updateAudioButtons();
    },
    
    toggleSFX: function() {
        sfxEnabled = !sfxEnabled;
        this.updateAudioButtons();
    },
    
    updateAudioButtons: function() {
        // Update music buttons
        const musicBtns = document.querySelectorAll('#music-toggle, #music-toggle-pause');
        musicBtns.forEach(btn => {
            btn.textContent = musicEnabled ? '🔊' : '🔇';
            btn.classList.toggle('muted', !musicEnabled);
        });
        
        // Update SFX buttons
        const sfxBtns = document.querySelectorAll('#sfx-toggle, #sfx-toggle-pause');
        sfxBtns.forEach(btn => {
            btn.textContent = sfxEnabled ? '🔔' : '🔕';
            btn.classList.toggle('muted', !sfxEnabled);
        });
    },
    
    playSound: function(sound) {
        if (!sfxEnabled) return;
        
        // Clone the audio to allow overlapping sounds
        const audio = audioAssets.sfx[sound].cloneNode();
        audio.play();
    },
    
    startBackgroundMusic: function() {
        if (!musicEnabled) return;
        
        audioAssets.music.background.currentTime = 0;
        audioAssets.music.background.play();
    },
    
    stopBackgroundMusic: function() {
        audioAssets.music.background.pause();
    },

    startGame: function() {
        // Reset game state
        gameState.player.lane = 1;
        gameState.player.y = gameState.lanes[1].y;
        gameState.player.isJumping = false;
        gameState.player.velocityY = 0;
        gameState.player.frameX = 0;
        gameState.player.frameY = 0;
        gameState.player.animState = 'running';
        gameState.player.invulnerable = false;
        
        gameState.background.x = 0;
        gameState.collectibles = [];
        gameState.obstacles = [];
        gameState.powerUp.active = false;
        gameState.powerUp.type = null;
        gameState.powerUp.timeLeft = 0;
        gameState.ui.combo = 0;

        // Choose environment
        if (selectedEnvironment === 'random') {
            gameState.environment = Math.random() < 0.5 ? 'forest' : 'kitchen';
        } else {
            gameState.environment = selectedEnvironment;
        }
        localStorage.setItem('mushroom-dash-environment', selectedEnvironment);
        
        // Validate character selection before starting
        if (!selectedCharacter) {
            console.error("Attempted to start game without character selection");
            alert("Please select a character before starting the game.");
            this.showScreen('screen-title');
            return;
        }
        
        // Reset score
        this.scoreManager.resetScore();
        
        // Set game as active
        gameActive = true;
        isPaused = false;
        gameTime = 0;
        
        // Show gameplay screen
        this.showScreen('screen-gameplay');
        
        // Start game loop
        lastTimestamp = performance.now();
        this.gameLoop(lastTimestamp);
        
        // Start timer
        this.updateTimerBar(100);
        gameTimer = setTimeout(() => {
            this.endGame();
        }, GAME_DURATION);
        
        // Start music
        this.startBackgroundMusic();
    },

    gameLoop: function(timestamp) {
        if (!gameActive || isPaused) return;
        
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // Update game time
        gameTime += deltaTime;
        
        // Update timer bar
        const timeRemaining = Math.max(0, GAME_DURATION - gameTime);
        const timerPercentage = (timeRemaining / GAME_DURATION) * 100;
        this.updateTimerBar(timerPercentage);
        
        // Calculate frame rate and update performance mode
        if (deltaTime > 0) {
            const currentFps = Math.round(1000 / deltaTime);
            gameState.diagnostics.lastFrameRate = currentFps;
            
            // Update FPS history for performance monitoring
            this.updatePerformance(currentFps);
            
            // Update FPS counter if in debug mode
            if (debugMode) {
                this.updateFPSCounter(currentFps);
                
                // Show performance mode
                const fpsCounter = document.getElementById('fps-counter');
                if (fpsCounter) {
                    fpsCounter.textContent = `${currentFps} FPS (${performanceMode})`;
                }
                
                // Show debug mode indicator
                this.showDebugIndicator();
            } else {
                // Hide FPS counter if debug is off
                const fpsCounter = document.getElementById('fps-counter');
                if (fpsCounter) {
                    fpsCounter.style.display = 'none';
                }
                
                // Hide debug indicator
                const debugIndicator = document.getElementById('debug-indicator');
                if (debugIndicator) {
                    debugIndicator.style.display = 'none';
                }
            }
        }
        
        try {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw game elements
            this.updateBackground();
            this.updatePlayer(deltaTime);
            this.updateCollectibles(deltaTime);
            this.updateObstacles(deltaTime);
            this.updatePowerUp(deltaTime);
            
            // Spawn new elements - adjust spawn rates based on performance mode
            let collectibleSpawnChance = 0.02;
            let obstacleSpawnChance = 0.01;
            
            // Adjust spawn rates based on performance mode
            if (performanceMode === 'low') {
                collectibleSpawnChance = 0.01;
                obstacleSpawnChance = 0.005;
            } else if (performanceMode === 'medium') {
                collectibleSpawnChance = 0.015;
                obstacleSpawnChance = 0.0075;
            }
            
            if (Math.random() < collectibleSpawnChance) {
                this.spawnCollectible();
            }
            
            if (Math.random() < obstacleSpawnChance) {
                this.spawnObstacle();
            }
            
            // Check collisions
            this.checkCollisions();
            
            // Update score display
            document.getElementById('current-score').textContent = this.scoreManager.currentScore;
            
            // Update combo meter
            const comboPercentage = (gameState.ui.combo / gameState.ui.maxCombo) * 100;
            document.querySelector('.combo-bar').style.width = `${comboPercentage}%`;
            
            // Draw debug information if enabled
            if (debugMode) {
                this.drawDebugInfo();
            }
        } catch (error) {
            // Catch any rendering errors to prevent game from freezing
            console.error("Game loop error:", error);
            
            // Show error on screen
            ctx.fillStyle = "#ff0000";
            ctx.font = "20px Arial";
            ctx.fillText("Game rendering error - check console", 20, 60);
        }
        
        // Request next frame
        animationFrame = requestAnimationFrame((t) => this.gameLoop(t));
    },

    updateBackground: function() {
        // Move background layers at different speeds for parallax effect
        gameState.background.x -= gameState.background.speed;
        
        const env = gameState.environment || 'forest';
        const bgWidth = canvas.width;
        const layer1X = gameState.background.x % bgWidth;
        const layer2X = (gameState.background.x * 0.8) % bgWidth;
        const layer3X = (gameState.background.x * 0.5) % bgWidth;
        
        try {
            const bgAssets = assets.backgrounds[env];
            if (bgAssets.layer3) {
                ctx.drawImage(bgAssets.layer3, layer3X, 0, bgWidth, canvas.height);
                ctx.drawImage(bgAssets.layer3, layer3X + bgWidth, 0, bgWidth, canvas.height);
            }

            if (bgAssets.layer2) {
                ctx.drawImage(bgAssets.layer2, layer2X, 0, bgWidth, canvas.height);
                ctx.drawImage(bgAssets.layer2, layer2X + bgWidth, 0, bgWidth, canvas.height);
            }

            if (bgAssets.layer1) {
                ctx.drawImage(bgAssets.layer1, layer1X, 0, bgWidth, canvas.height);
                ctx.drawImage(bgAssets.layer1, layer1X + bgWidth, 0, bgWidth, canvas.height);
            }
        } catch (error) {
            // Catch and handle rendering errors
            console.error("Background rendering error:", error);
            
            // Draw a fallback background
            ctx.fillStyle = "#93c572"; // Light green
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (debugMode) {
                ctx.fillStyle = "#ffffff";
                ctx.font = "20px Arial";
                ctx.fillText("Background rendering error - check console", 20, 30);
            }
        }
    },

    updatePlayer: function(deltaTime) {
        const player = gameState.player;
        
        // Handle jumping
        if (player.isJumping) {
            player.velocityY += 0.5; // Gravity
            player.y += player.velocityY;
            
            // Check if landed
            if (player.y >= gameState.lanes[player.lane].y) {
                player.y = gameState.lanes[player.lane].y;
                player.isJumping = false;
                player.velocityY = 0;
                player.animState = 'running';
            }
        }
        
        // Draw player sprite
        this.drawPlayerSprite();
    },

    drawPlayerSprite: function() {
        const player = gameState.player;
        
        // If no character is selected, use a default
        const character = selectedCharacter || 'leo';
        
        // Get the appropriate sprite sheet - with error handling
        let spriteSheet = null;
        try {
            spriteSheet = assets.sprites[character][player.animState];
        } catch (error) {
            console.error(`Failed to access sprite for ${character} in ${player.animState} state:`, error);
            // Add to diagnostics
            if (!gameState.diagnostics.missingAssets.includes(`character sprite: ${character}_${player.animState}`)) {
                gameState.diagnostics.missingAssets.push(`character sprite: ${character}_${player.animState}`);
            }
        }
        
        // Animation speed control
        player.frameCount++;
        if (player.frameCount >= player.frameDelay) {
            player.frameCount = 0;
            player.frameX = (player.frameX + 1) % 4; // Assuming 4 frames per animation
        }
        
        // Power-up visual effect
        if (gameState.powerUp.active) {
            ctx.save();
            
            // Draw power-up glow
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = this.getPowerUpColor();
            ctx.beginPath();
            ctx.arc(player.x + player.width/2, player.y - player.height/2, 
                    player.width * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // Flash effect when hit
        if (player.invulnerable && Math.floor(performance.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw the correct frame from the sprite sheet or a fallback
        if (spriteSheet) {
            try {
                // Determine frame size based on sprite sheet
                const frameWidth = spriteSheet.width / 4; // Assuming 4 columns
                const frameHeight = spriteSheet.height;
                
                ctx.drawImage(
                    spriteSheet,
                    frameWidth * player.frameX, 0,
                    frameWidth, frameHeight,
                    player.x, player.y - player.height,
                    player.width, player.height
                );
            } catch (error) {
                console.error("Error drawing player sprite:", error);
                this.drawPlayerFallback(player, character);
            }
        } else {
            // Draw fallback if sprite sheet is missing
            this.drawPlayerFallback(player, character);
        }
        
        // Reset transparency
        ctx.globalAlpha = 1;
    },
    
    // Fallback drawing function when sprites are missing
    drawPlayerFallback: function(player, character) {
        // Create a colorful fallback character
        let color;
        switch (character) {
            case 'leo': color = '#8B4513'; break; // Brown
            case 'remi': color = '#B22222'; break; // Red
            case 'spora': color = '#FFD700'; break; // Yellow/gold
            default: color = '#8B4513'; break;
        }
        
        ctx.save();
        
        // Draw body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
            player.x + player.width/2, 
            player.y - player.height/2, 
            player.width/2, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw face
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(
            player.x + player.width/2 - 10, 
            player.y - player.height/2 - 5, 
            5, 
            0, Math.PI * 2
        );
        ctx.arc(
            player.x + player.width/2 + 10, 
            player.y - player.height/2 - 5, 
            5, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw character name
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.fillText(
            character.charAt(0).toUpperCase() + character.slice(1), 
            player.x + player.width/2, 
            player.y - player.height + 20
        );
        
        // Animation effect
        if (gameState.player.frameX % 2 === 0) {
            // Simple bouncing effect
            ctx.translate(0, Math.sin(performance.now() / 100) * 3);
        }
        
        ctx.restore();
    },

    getPowerUpColor: function() {
        switch(gameState.powerUp.type) {
            case 'focus': return '#3498db'; // Blue for Leo
            case 'shield': return '#e74c3c'; // Red for Remi
            case 'energy': return '#f1c40f'; // Yellow for Spora
            default: return '#ffffff';
        }
    },

    updateCollectibles: function(deltaTime) {
        // Move collectibles
        for (let i = gameState.collectibles.length - 1; i >= 0; i--) {
            const collectible = gameState.collectibles[i];
            collectible.x -= gameState.background.speed * 1.2;
            
            // Remove if off screen
            if (collectible.x < -collectible.width) {
                gameState.collectibles.splice(i, 1);
                continue;
            }
            
            // Draw collectible
            this.drawCollectible(collectible);
        }
    },

    updateObstacles: function(deltaTime) {
        // Move obstacles
        for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
            const obstacle = gameState.obstacles[i];
            obstacle.x -= gameState.background.speed * 1.3;
            
            // Remove if off screen
            if (obstacle.x < -obstacle.width) {
                gameState.obstacles.splice(i, 1);
                continue;
            }
            
            // Draw obstacle
            this.drawObstacle(obstacle);
        }
    },

    updatePowerUp: function(deltaTime) {
        if (gameState.powerUp.active) {
            gameState.powerUp.timeLeft -= deltaTime;
            
            if (gameState.powerUp.timeLeft <= 0) {
                // End power-up
                gameState.powerUp.active = false;
                this.scoreManager.deactivatePowerUp(gameState.powerUp.type);
                gameState.powerUp.type = null;
            }
        }
    },

    spawnCollectible: function() {
        // Determine collectible type
        const types = ['brain', 'heart', 'energy', 'chocolate'];
        const weights = [0.25, 0.25, 0.25, 0.1]; // Chocolate is rarer
        
        let type;
        const rand = Math.random();
        let weightSum = 0;
        
        for (let i = 0; i < types.length; i++) {
            weightSum += weights[i];
            if (rand < weightSum) {
                type = types[i];
                break;
            }
        }
        
        // Randomly choose a lane
        const lane = Math.floor(Math.random() * 3);
        
        // Create collectible
        const collectible = {
            type: type,
            x: canvas.width,
            y: gameState.lanes[lane].y,
            width: 40,
            height: 40,
            lane: lane
        };
        
        gameState.collectibles.push(collectible);
    },

    spawnObstacle: function() {
        // Determine obstacle type
        const types = ['sugarCube', 'sodaCan', 'coffeeCup'];
        const weights = [0.5, 0.3, 0.2]; // Sugar cubes most common, coffee cups least common
        
        let type;
        const rand = Math.random();
        let weightSum = 0;
        
        for (let i = 0; i < types.length; i++) {
            weightSum += weights[i];
            if (rand < weightSum) {
                type = types[i];
                break;
            }
        }
        
        // Randomly choose a lane
        const lane = Math.floor(Math.random() * 3);
        
        // Determine size based on type
        let width, height;
        switch(type) {
            case 'sugarCube':
                width = 50;
                height = 50;
                break;
            case 'sodaCan':
                width = 40;
                height = 70;
                break;
            case 'coffeeCup':
                width = 60;
                height = 80;
                break;
        }
        
        // Create obstacle
        const obstacle = {
            type: type,
            x: canvas.width,
            y: gameState.lanes[lane].y,
            width: width,
            height: height,
            lane: lane
        };
        
        gameState.obstacles.push(obstacle);
    },

    checkCollisions: function() {
        const player = gameState.player;
        
        // Calculate hitbox (smaller than sprite for better gameplay)
        const playerHitbox = {
            x: player.x + player.width * 0.2,
            y: player.y - player.height * 0.8,
            width: player.width * 0.6,
            height: player.height * 0.6
        };
        
        // Debug mode: draw player hitbox
        if (debugMode) {
            this.drawHitbox(playerHitbox, '#00ff00');
        }
        
        // Check collectible collisions
        for (let i = gameState.collectibles.length - 1; i >= 0; i--) {
            const collectible = gameState.collectibles[i];
            
            // Debug mode: draw collectible hitbox
            if (debugMode) {
                this.drawHitbox(collectible, '#0000ff');
            }
            
            // Simple rectangle collision
            if (this.checkRectCollision(playerHitbox, collectible)) {
                // Collect item
                this.collectItem(collectible.type);
                gameState.collectibles.splice(i, 1);
            }
        }
        
        // Check obstacle collisions if not invulnerable
        if (!player.invulnerable) {
            for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
                const obstacle = gameState.obstacles[i];
                
                // Debug mode: draw obstacle hitbox
                if (debugMode) {
                    this.drawHitbox(obstacle, '#ff0000');
                }
                
                // Simple rectangle collision
                if (this.checkRectCollision(playerHitbox, obstacle)) {
                    // Hit obstacle
                    this.hitObstacle();
                    break;
                }
            }
        }
    },

    // Improved collision detection
    checkRectCollision: function(rect1, rect2) {
        // Ensure all necessary properties exist and are numeric
        if (!rect1 || !rect2 || 
            typeof rect1.x !== 'number' || typeof rect1.y !== 'number' ||
            typeof rect1.width !== 'number' || typeof rect1.height !== 'number' ||
            typeof rect2.x !== 'number' || typeof rect2.y !== 'number' ||
            typeof rect2.width !== 'number' || typeof rect2.height !== 'number') {
            // Log a diagnostic issue
            gameState.diagnostics.collisionIssues++;
            console.warn("Invalid hitbox detected", rect1, rect2);
            return false;
        }
        
        // Fixed collision detection logic
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y - rect1.height < rect2.y &&
            rect1.y > rect2.y - rect2.height
        );
    },
    
    // Draw hitbox for debugging
    drawHitbox: function(rect, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        // Draw rectangle for hitbox
        ctx.strokeRect(
            rect.x,
            rect.y - rect.height,
            rect.width,
            rect.height
        );
        
        // Label the hitbox with its dimensions
        ctx.fillStyle = color;
        ctx.font = '10px Arial';
        ctx.fillText(
            `(${Math.round(rect.x)},${Math.round(rect.y)}) ${Math.round(rect.width)}x${Math.round(rect.height)}`,
            rect.x,
            rect.y - rect.height - 5
        );
        
        ctx.restore();
    },

    collectItem: function(type) {
        // Add points
        const points = this.scoreManager.addPoints(type);
        
        // Increase combo
        gameState.ui.combo++;
        
        // Check if combo is full for power-up
        if (gameState.ui.combo >= gameState.ui.maxCombo) {
            this.activatePowerUp();
        }
        
        // Show floating score text
        this.showFloatingText(`+${points}`, gameState.player.x, gameState.player.y - 50);
        
        // Play appropriate sound effect
        if (type === 'chocolate') {
            this.playSound('collectChocolate');
        } else {
            this.playSound('collectItem');
        }
        
        // Create particles for visual feedback
        this.createCollectParticles(gameState.player.x, gameState.player.y - 40, this.getParticleColor(type));
    },

    hitObstacle: function() {
        // Set player to hurt animation
        gameState.player.animState = 'hurt';
        
        // Reset combo
        gameState.ui.combo = 0;
        this.scoreManager.handleObstacleHit();
        
        // Make player invulnerable briefly
        gameState.player.invulnerable = true;
        setTimeout(() => {
            gameState.player.invulnerable = false;
            if (!gameState.player.isJumping) {
                gameState.player.animState = 'running';
            }
        }, 1500);
        
        // Screen shake effect
        this.screenShake();
        
        // Play hit sound
        this.playSound('hitObstacle');
        
        // Create particles for visual feedback
        this.createCollectParticles(gameState.player.x, gameState.player.y - 40, '#e74c3c');
    },

    activatePowerUp: function() {
        // Reset combo
        gameState.ui.combo = 0;
        
        // Determine power-up type based on character
        const powerUpType = this.scoreManager.activatePowerUp(selectedCharacter);
        
        // Set power-up state
        gameState.powerUp.active = true;
        gameState.powerUp.type = powerUpType;
        gameState.powerUp.timeLeft = GAME_CONFIG.powerUpDuration;
        
        // Show power-up screen
        const powerUpScreen = document.getElementById('screen-power-up');
        const powerUpText = powerUpScreen.querySelector('.power-up-text');
        
        switch(powerUpType) {
            case 'focus':
                powerUpText.textContent = 'FOCUS MODE ACTIVATED!';
                break;
            case 'shield':
                powerUpText.textContent = 'SHIELD ACTIVATED!';
                break;
            case 'energy':
                powerUpText.textContent = 'ENERGY BOOST ACTIVATED!';
                break;
        }
        
        powerUpScreen.classList.add('active');
        setTimeout(() => {
            powerUpScreen.classList.remove('active');
        }, 2000);
        
        // Play power-up sound
        this.playSound('powerUp');
        
        // Create particles for visual feedback
        this.createPowerUpParticles(this.getPowerUpColor());
    },

    getParticleColor: function(type) {
        switch(type) {
            case 'brain': return '#3498db';    // Blue
            case 'heart': return '#e74c3c';    // Red
            case 'energy': return '#f1c40f';   // Yellow
            case 'chocolate': return '#7b3f00'; // Brown
            default: return '#ffffff';         // White
        }
    },

    createCollectParticles: function(x, y, color) {
        const particleContainer = document.getElementById('particle-container');
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            
            // Use different particle types for visual variety
            const types = ['', 'star', 'sparkle', 'circle'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            particle.className = `particle ${randomType}`;
            
            if (randomType === 'circle') {
                particle.style.borderColor = color;
            } else {
                particle.style.backgroundColor = color;
            }
            
            // Random position around the collection point
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = (Math.random() - 0.5) * 60;
            
            particle.style.left = (x + offsetX) + 'px';
            particle.style.top = (y + offsetY) + 'px';
            
            // Remove after animation completes
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
            
            particleContainer.appendChild(particle);
        }
    },
    
    createPowerUpParticles: function(color) {
        const particleContainer = document.getElementById('particle-container');
        const player = gameState.player;
        
        // Create a burst of particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            
            // Use different particle types for visual variety
            const types = ['star', 'sparkle', 'circle', 'confetti'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            particle.className = `particle ${randomType}`;
            
            if (randomType === 'circle') {
                particle.style.borderColor = color;
            } else if (randomType === 'confetti') {
                // For confetti, use random colors
                const confettiColors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
                particle.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            } else {
                particle.style.backgroundColor = color;
            }
            
            // Random position in a circle around the player
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 20;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            
            particle.style.left = (player.x + player.width/2 + offsetX) + 'px';
            particle.style.top = (player.y - player.height/2 + offsetY) + 'px';
            
            // Remove after animation completes
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
            
            particleContainer.appendChild(particle);
        }
        
        // Add a wave effect
        const wave = document.createElement('div');
        wave.className = 'particle circle';
        wave.style.borderColor = color;
        wave.style.width = '100px';
        wave.style.height = '100px';
        wave.style.left = (player.x + player.width/2) + 'px';
        wave.style.top = (player.y - player.height/2) + 'px';
        
        wave.addEventListener('animationend', () => {
            wave.remove();
        });
        
        particleContainer.appendChild(wave);
    },

    showFloatingText: function(text, x, y) {
        ctx.save();
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#f5c542';
        ctx.strokeStyle = '#7b3f00';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.restore();
    },

    screenShake: function() {
        const gameContainer = document.getElementById('game-container');
        gameContainer.classList.add('shake');
        setTimeout(() => {
            gameContainer.classList.remove('shake');
        }, 500);
    },

    jump: function() {
        if (gameActive && !isPaused && !gameState.player.isJumping) {
            gameState.player.isJumping = true;
            gameState.player.velocityY = -12;
            gameState.player.animState = 'jumping';
            
            // Play jump sound
            this.playSound('jump');
        }
    },

    moveUp: function() {
        if (gameActive && !isPaused && gameState.player.lane > 0) {
            gameState.player.lane--;
            if (!gameState.player.isJumping) {
                gameState.player.y = gameState.lanes[gameState.player.lane].y;
            }
        }
    },

    moveDown: function() {
        if (gameActive && !isPaused && gameState.player.lane < 2) {
            gameState.player.lane++;
            if (!gameState.player.isJumping) {
                gameState.player.y = gameState.lanes[gameState.player.lane].y;
            }
        }
    },

    togglePause: function() {
        isPaused = !isPaused;
        
        if (isPaused) {
            // Pause the game
            clearTimeout(gameTimer);
            cancelAnimationFrame(animationFrame);
            
            // Pause music
            audioAssets.music.background.pause();
            
            // Show pause menu
            document.getElementById('pause-menu').classList.add('active');
        } else {
            this.resumeGame();
        }
    },
    
    resumeGame: function() {
        if (!isPaused) return;
        
        // Hide pause menu
        document.getElementById('pause-menu').classList.remove('active');
        
        // Resume the game
        const remainingTime = GAME_DURATION - gameTime;
        gameTimer = setTimeout(() => {
            this.endGame();
        }, remainingTime);
        
        // Resume music if enabled
        if (musicEnabled) {
            audioAssets.music.background.play();
        }
        
        lastTimestamp = performance.now();
        isPaused = false;
        this.gameLoop(lastTimestamp);
    },

    updateTimerBar: function(percentage) {
        document.querySelector('.timer-bar').style.width = `${percentage}%`;
    },

    endGame: function() {
        // Stop game loop
        gameActive = false;
        clearTimeout(gameTimer);
        cancelAnimationFrame(animationFrame);
        
        // Stop music
        this.stopBackgroundMusic();
        
        // Play game over sound
        this.playSound('gameOver');
        
        // Get final score
        const finalScore = this.scoreManager.getFinalScore();
        
        // Update score display
        document.getElementById('final-score').textContent = finalScore.score;
        document.getElementById('brain-count').textContent = finalScore.items.brain;
        document.getElementById('heart-count').textContent = finalScore.items.heart;
        document.getElementById('energy-count').textContent = finalScore.items.energy;
        document.getElementById('chocolate-count').textContent = finalScore.items.chocolate;
        
        // Show celebration character
        const celebrationDiv = document.querySelector('.character-celebration');
        celebrationDiv.style.backgroundImage = `url('sprites/${selectedCharacter}_celebration.png')`;
        
        // Update leaderboard
        this.updateLeaderboard();
        
        // Add contest entry
        new ContestManager().addGameplayEntry(finalScore.score);
        
        // Show game end screen
        this.showScreen('screen-game-end');
    },

    resetGame: function() {
        // Clear any existing game timer
        if (gameTimer) {
            clearTimeout(gameTimer);
            gameTimer = null;
        }
        
        // Cancel any animation frame
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        
        // Reset game state
        gameActive = false;
        isPaused = false;
        gameTime = 0;
        lastTimestamp = 0;
        
        // Reset player state
        gameState.player.lane = 1;
        gameState.player.y = gameState.lanes[1].y;
        gameState.player.isJumping = false;
        gameState.player.velocityY = 0;
        gameState.player.frameX = 0;
        gameState.player.frameY = 0;
        gameState.player.animState = 'running';
        gameState.player.invulnerable = false;
        
        // Reset game objects
        gameState.background.x = 0;
        gameState.collectibles = [];
        gameState.obstacles = [];
        
        // Reset power-up
        gameState.powerUp.active = false;
        gameState.powerUp.type = null;
        gameState.powerUp.timeLeft = 0;
        
        // Reset UI
        gameState.ui.combo = 0;
        
        // Reset score
        if (this.scoreManager) {
            this.scoreManager.resetScore();
        }
        
        // Stop music
        this.stopBackgroundMusic();
        
        // Reset diagnostics but keep track of missing assets
        const missingAssets = [...gameState.diagnostics.missingAssets];
        gameState.diagnostics = {
            missingAssets: missingAssets,
            collisionIssues: 0,
            lastFrameRate: 0,
            lastError: null
        };
        
        // Clear any error messages
        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        // Clear pause menu
        document.getElementById('pause-menu').classList.remove('active');
        
        // Update UI elements
        document.getElementById('current-score').textContent = '0';
        document.querySelector('.combo-bar').style.width = '0%';
        document.querySelector('.timer-bar').style.width = '100%';
    },

    showScreen: function(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.game-screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
        
        // Extra logic for specific screens
        if (screenId === 'screen-title') {
            // Reset player selection
            selectedCharacter = null;
            const characters = document.querySelectorAll('.character');
            characters.forEach(char => char.classList.remove('selected'));
            document.getElementById('start-button').disabled = true;

            // Update high score display
            const highScoreElem = document.getElementById('high-score');
            if (highScoreElem) {
                highScoreElem.textContent = this.scoreManager.getHighScore();
            }

            // Update environment selector to saved value
            const envSel = document.getElementById('environment-selector');
            if (envSel) {
                envSel.value = selectedEnvironment;
            }
            
            // Ensure any ongoing game is properly stopped
            if (gameActive) {
                this.resetGame();
            }
        }
    },

    prepareShareScreen: function() {
        const score = this.scoreManager.getFinalScore().score;
        
        // Update share preview
        document.querySelector('.share-score-value').textContent = score;
        document.querySelector('.share-character').style.backgroundImage = 
            `url('sprites/${selectedCharacter}_celebration.png')`;
        
        // Update share message
        document.getElementById('share-message').value = 
            `I scored ${score} points in Mushroom Dash! 🍄💥`;
    },

    updateLeaderboard: function() {
        const leaderboardDiv = document.getElementById('leaderboard-list');
        const topScores = this.leaderboardManager.getTopScores(5);
        
        leaderboardDiv.innerHTML = '';
        
        topScores.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'leaderboard-entry';
            entryDiv.innerHTML = `
                <span class="entry-rank">${index + 1}.</span>
                <span class="entry-name">${entry.name}</span>
                <span class="entry-score">${entry.score}</span>
            `;
            leaderboardDiv.appendChild(entryDiv);
        });
    },

    // Debug info overlay
    drawDebugInfo: function() {
        ctx.save();
        
        // Set text properties
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Courier New";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;
        
        // Create debug background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(10, 10, 250, 160); // Increased height to accommodate error message
        
        // Text color
        ctx.fillStyle = "#00ff00";
        
        // Draw debug information
        let y = 30;
        ctx.fillText(`FPS: ${gameState.diagnostics.lastFrameRate}`, 20, y);
        y += 20;
        ctx.fillText(`Character: ${selectedCharacter || "none"}`, 20, y);
        y += 20;
        ctx.fillText(`Collectibles: ${gameState.collectibles.length}`, 20, y);
        y += 20;
        ctx.fillText(`Obstacles: ${gameState.obstacles.length}`, 20, y);
        y += 20;
        ctx.fillText(`Collision Issues: ${gameState.diagnostics.collisionIssues}`, 20, y);
        y += 20;
        ctx.fillText(`Missing Assets: ${gameState.diagnostics.missingAssets.length}`, 20, y);
        
        // Show last error if any
        if (gameState.diagnostics.lastError) {
            y += 20;
            ctx.fillStyle = "#ff5555"; // Red for error
            
            // Truncate long error messages
            let errorMsg = gameState.diagnostics.lastError;
            if (errorMsg.length > 30) {
                errorMsg = errorMsg.substring(0, 30) + "...";
            }
            
            ctx.fillText(`Error: ${errorMsg}`, 20, y);
        }
        
        // Show performance mode
        y += 20;
        ctx.fillStyle = "#00ffff"; // Cyan for performance
        ctx.fillText(`Mode: ${performanceMode}`, 20, y);
        
        ctx.restore();
    },

    // Setup global error handling
    setupErrorHandling: function() {
        // Keep track of error frequency
        let errorCount = 0;
        const ERROR_THRESHOLD = 5; // Only show error dialog after this many errors
        let lastErrorTime = 0;
        const ERROR_COOLDOWN = 10000; // 10 seconds between showing error dialogs
        
        // Catch unhandled errors to prevent complete game crash
        window.addEventListener('error', (event) => {
            console.error('Game error:', event.error);
            
            // Only track errors during gameplay
            if (gameActive) {
                // Determine if this is a critical error or a minor one
                const isCritical = this.isErrorCritical(event.error);
                
                if (isCritical) {
                    this.handleGameError(event.error, true);
                } else {
                    // For minor errors, just count them and only show dialog if they persist
                    errorCount++;
                    
                    // Reset error count if it's been a while since the last error
                    const now = Date.now();
                    if (now - lastErrorTime > 30000) { // 30 seconds
                        errorCount = 1;
                    }
                    lastErrorTime = now;
                    
                    // Only show error dialog if errors are frequent and cooldown has passed
                    if (errorCount > ERROR_THRESHOLD && (now - lastErrorTime > ERROR_COOLDOWN)) {
                        this.handleGameError(event.error, false);
                    }
                }
            }
            
            // Prevent default browser error handling
            event.preventDefault();
            return true;
        });
        
        // Handle promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            // Only handle during gameplay
            if (gameActive) {
                // Determine if this is a critical error
                const isCritical = this.isErrorCritical(event.reason);
                
                if (isCritical) {
                    this.handleGameError(event.reason, true);
                } else {
                    // Non-critical errors just get logged
                    errorCount++;
                }
            }
            
            // Prevent default browser error handling
            event.preventDefault();
            return true;
        });
    },
    
    // Check if an error is critical
    isErrorCritical: function(error) {
        // Consider errors critical if they contain certain keywords
        const criticalPatterns = [
            'undefined is not an object',
            'null is not an object',
            'cannot read property',
            'is not a function',
            'canvas context',
            'out of memory'
        ];
        
        // Non-critical (common) errors that should be suppressed
        const nonCriticalPatterns = [
            'Failed to load resource',
            'Image not loaded',
            'Unable to get image data',
            'sprite sheet',
            'audio',
            'sound',
            'music',
            '404',
            'not found',
            'net::ERR_'
        ];
        
        if (!error || !error.message) return false;
        
        const errorMessage = error.message.toLowerCase();
        const errorStack = error.stack ? error.stack.toLowerCase() : '';
        
        // Check if error message contains any non-critical patterns first
        const isNonCritical = nonCriticalPatterns.some(pattern => 
            errorMessage.includes(pattern.toLowerCase()) || 
            errorStack.includes(pattern.toLowerCase())
        );
        
        // If it's a known non-critical error, don't treat as critical
        if (isNonCritical) {
            // Still track it in debug diagnostics
            if (debugMode) {
                gameState.diagnostics.lastError = error.message || "Unknown asset error";
            }
            return false;
        }
        
        // Check if error message contains any critical patterns
        return criticalPatterns.some(pattern => 
            errorMessage.includes(pattern.toLowerCase()) || 
            errorStack.includes(pattern.toLowerCase())
        );
    },

    // Handle game errors gracefully
    handleGameError: function(error, isCritical) {
        console.error('Game error caught:', error);
        
        // For non-critical errors in debug mode, just show in debug overlay
        if (!isCritical && debugMode) {
            gameState.diagnostics.lastError = error.message || "Unknown error";
            return;
        }
        
        // Check if error message element already exists
        let errorElement = document.querySelector('.error-message');
        
        if (!errorElement) {
            // Create error message element
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            
            const errorTitle = document.createElement('h3');
            errorTitle.textContent = 'Game Error Detected';
            
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Something went wrong with the game. Try these options:';
            
            const errorList = document.createElement('ul');
            errorList.style.textAlign = 'left';
            errorList.style.paddingLeft = '20px';
            errorList.style.margin = '10px 0';
            
            const errorItems = [
                'Press "Continue" to try resuming the game (may work for minor errors)',
                'Press "Restart" to reset the game and try again',
                'Enable debug mode (press D) to help identify the issue'
            ];
            
            errorItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                errorList.appendChild(li);
            });
            
            const continueButton = document.createElement('button');
            continueButton.textContent = 'Continue';
            continueButton.addEventListener('click', () => {
                errorElement.remove();
                // Try to resume game
                if (isPaused) {
                    this.resumeGame();
                }
            });
            
            const restartButton = document.createElement('button');
            restartButton.textContent = 'Restart Game';
            restartButton.style.marginLeft = '10px';
            restartButton.addEventListener('click', () => {
                errorElement.remove();
                // Reset and restart game
                this.resetGame();
                this.showScreen('screen-title');
            });
            
            // Assemble error message
            errorElement.appendChild(errorTitle);
            errorElement.appendChild(errorMessage);
            errorElement.appendChild(errorList);
            errorElement.appendChild(continueButton);
            errorElement.appendChild(restartButton);
            
            // Add to game container
            document.getElementById('game-container').appendChild(errorElement);
            
            // Auto-remove after 15 seconds to prevent being stuck
            setTimeout(() => {
                if (document.body.contains(errorElement)) {
                    errorElement.remove();
                }
            }, 15000);
        }
        
        // Pause the game if critical error
        if (gameActive && !isPaused && isCritical) {
            this.togglePause();
        }
    },

    // Similar safe drawing for collectibles
    drawCollectible: function(collectible) {
        try {
            const img = assets.collectibles[collectible.type];
            if (img) {
                ctx.drawImage(img, collectible.x, collectible.y - collectible.height, collectible.width, collectible.height);
            } else {
                throw new Error(`Collectible image not found for ${collectible.type}`);
            }
        } catch (error) {
            console.warn(`Error drawing collectible (${collectible.type}):`, error);
            
            // Add to diagnostics
            if (!gameState.diagnostics.missingAssets.includes(`collectible: ${collectible.type}`)) {
                gameState.diagnostics.missingAssets.push(`collectible: ${collectible.type}`);
            }
            
            // Draw fallback
            ctx.fillStyle = this.getParticleColor(collectible.type);
            ctx.fillRect(collectible.x, collectible.y - collectible.height, collectible.width, collectible.height);
            
            // Add text label
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(collectible.type, collectible.x + collectible.width/2, collectible.y - collectible.height/2);
        }
    },
    
    // Similar safe drawing for obstacles
    drawObstacle: function(obstacle) {
        try {
            const img = assets.obstacles[obstacle.type];
            if (img) {
                ctx.drawImage(img, obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
            } else {
                throw new Error(`Obstacle image not found for ${obstacle.type}`);
            }
        } catch (error) {
            console.warn(`Error drawing obstacle (${obstacle.type}):`, error);
            
            // Add to diagnostics
            if (!gameState.diagnostics.missingAssets.includes(`obstacle: ${obstacle.type}`)) {
                gameState.diagnostics.missingAssets.push(`obstacle: ${obstacle.type}`);
            }
            
            // Draw fallback
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
            
            // Add warning pattern
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            for (let i = 0; i < obstacle.width; i += 10) {
                ctx.beginPath();
                ctx.moveTo(obstacle.x + i, obstacle.y - obstacle.height);
                ctx.lineTo(obstacle.x + i + 5, obstacle.y);
                ctx.stroke();
            }
            
            // Add text label
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.type, obstacle.x + obstacle.width/2, obstacle.y - obstacle.height/2);
        }
    },

    // Add a new function to update the FPS counter
    updateFPSCounter: function(fps) {
        // Check if counter exists, create if not
        let fpsCounter = document.getElementById('fps-counter');
        
        if (!fpsCounter) {
            fpsCounter = document.createElement('div');
            fpsCounter.id = 'fps-counter';
            fpsCounter.className = 'fps-counter';
            document.getElementById('game-container').appendChild(fpsCounter);
        }
        
        // Update counter value and show it
        fpsCounter.textContent = `${fps} FPS`;
        fpsCounter.style.display = 'block';
        
        // Color code based on performance
        if (fps >= 50) {
            fpsCounter.style.color = '#4CAF50'; // Green for good performance
        } else if (fps >= 30) {
            fpsCounter.style.color = '#FFC107'; // Yellow for acceptable
        } else {
            fpsCounter.style.color = '#F44336'; // Red for poor performance
        }
    },

    // Add performance monitoring and adaptation
    updatePerformance: function(currentFps) {
        // Only monitor performance in auto mode
        if (performanceMode !== 'auto') return;
        
        // Add to FPS history
        fpsHistory.push(currentFps);
        
        // Keep history at desired length
        if (fpsHistory.length > FPS_HISTORY_LENGTH) {
            fpsHistory.shift();
        }
        
        // Only adapt performance after collecting enough samples
        if (fpsHistory.length >= FPS_HISTORY_LENGTH) {
            // Calculate average FPS
            const avgFps = fpsHistory.reduce((sum, fps) => sum + fps, 0) / fpsHistory.length;
            
            // Switch to appropriate performance mode
            if (avgFps < LOW_FPS_THRESHOLD) {
                this.setPerformanceMode('low');
            } else if (avgFps > HIGH_FPS_THRESHOLD) {
                this.setPerformanceMode('high');
            } else {
                this.setPerformanceMode('medium');
            }
        }
    },
    
    // Set performance mode and apply optimizations
    setPerformanceMode: function(mode) {
        // Don't change if already in that mode
        if (mode === performanceMode) return;
        
        console.log(`Switching to ${mode} performance mode`);
        performanceMode = mode;
        
        // Apply performance optimizations
        switch (mode) {
            case 'low':
                // Reduce background parallax layers
                document.body.classList.add('low-performance');
                // Reduce particle effects
                gameState.background.speed = 3; // Slower background
                break;
                
            case 'medium':
                // Standard settings
                document.body.classList.remove('low-performance');
                document.body.classList.remove('high-performance');
                gameState.background.speed = 5; // Normal background speed
                break;
                
            case 'high':
                // Enhanced visuals
                document.body.classList.add('high-performance');
                document.body.classList.remove('low-performance');
                gameState.background.speed = 6; // Faster background
                break;
        }
    },
    
    // Manual performance mode setter
    changePerformanceMode: function(mode) {
        performanceMode = mode;
        this.setPerformanceMode(mode);
        
        // Save to localStorage
        localStorage.setItem('mushroom-dash-performance', mode);
        
        // Update UI
        const performanceSelector = document.getElementById('performance-selector');
        if (performanceSelector) {
            performanceSelector.value = mode;
        }
    },

    // Show debug indicator
    showDebugIndicator: function() {
        let indicator = document.getElementById('debug-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'debug-indicator';
            indicator.className = 'debug-indicator';
            indicator.innerHTML = '🐞';
            document.getElementById('game-container').appendChild(indicator);
        }
        
        indicator.style.display = 'block';
    }
};

// Initialize the game when the page loads
window.addEventListener('load', () => {
    game.init();
});

// Add CSS for additional elements
const style = document.createElement('style');
style.textContent = `
    .game-screen.paused::before {
        content: "PAUSED";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        font-weight: bold;
        color: #7b3f00;
        background-color: rgba(255, 255, 255, 0.8);
        padding: 20px 40px;
        border-radius: 10px;
        z-index: 20;
    }
    
    .shake {
        animation: shake 0.5s;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .leaderboard-entry {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid #eee;
    }
    
    .entry-rank {
        font-weight: bold;
        width: 30px;
    }
    
    .entry-name {
        flex-grow: 1;
        text-align: left;
    }
    
    .entry-score {
        font-weight: bold;
        min-width: 70px;
        text-align: right;
    }
`;
document.head.appendChild(style); 