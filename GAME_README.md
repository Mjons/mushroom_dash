# Mushroom Dash Game - How to Run

## Overview
Mushroom Dash is a side-scrolling mini-game featuring three KINOKO mushroom characters (Leo, Remi, and Spora). Players collect mushroom ingredients and chocolate bars while dodging obstacles in a 45-second gameplay session.

## Running the Game

### Option 1: Using a Local Web Server
The recommended way to run the game is using a local web server:

1. Make sure you have Node.js installed on your computer
2. Open your terminal or command prompt
3. Navigate to the game directory
4. Run a simple HTTP server:

   Using Node.js (with npx):
   ```
   npx http-server -c-1
   ```

   or with Python (if installed):
   ```
   # Python 3
   python -m http.server

   # Python 2
   python -m SimpleHTTPServer
   ```

5. Open your browser and navigate to:
   - For Node.js server: `http://localhost:8080`
   - For Python server: `http://localhost:8000`

### Option 2: Opening Directly in Browser
For quick testing, you can open the index.html file directly in your browser:

1. Navigate to the game directory in your file explorer
2. Double-click on `index.html` or right-click and select "Open with" your preferred browser

Note: Some browsers have security restrictions that may prevent the game from loading images when opened directly. If you experience issues, please use Option 1 with a local server.

## Game Controls

- **Desktop**:
  - Space or Up Arrow: Jump
  - Left Arrow: Move to upper lane
  - Right/Down Arrow: Move to lower lane
  - Escape: Pause game

- **Mobile**:
  - Tap screen: Jump
  - Swipe up/down (future update): Change lanes

## Game Features

- Choose between three mushroom characters with unique power-ups
- Collect brain icons, heart icons, energy icons, and chocolate bars
- Avoid obstacles like sugar cubes, soda cans, and coffee cups
- Activate special power-ups by filling the combo meter
- Track your high scores and compete on the leaderboard
- Share your score on social media
- Enter the weekly contest to win real KINOKO chocolate

## Troubleshooting

If you encounter issues with the game:

1. Make sure all game files are in the correct directory structure
2. Check your browser console for any JavaScript errors
3. Try using a different browser (Chrome, Firefox, or Edge recommended)
4. Ensure your browser allows JavaScript and has Canvas support
5. If using a local server, ensure the server is running correctly 

// Game State
const gameState = {
    player: {
        x: 100,
        y: 880,          // Position at the ground level
        width: 200,      // Much larger for better visibility
        height: 200,     // Much larger for better visibility
        velocityY: 0,
        isJumping: false,
        lane: 1,         // 0 = top, 1 = middle, 2 = bottom
        animState: 'running',
        frameX: 0,
        frameY: 0,
        frameCount: 0,
        frameDelay: 5,
        invulnerable: false
    },
    lanes: [
        { y: 880 },      // All lanes on the ground
        { y: 880 },      // Keep all lanes at same height for now
        { y: 880 }       // Keep all lanes at same height for now
    ],
    // rest of the code stays the same
} 