# KINOKO Mini-Game: "Mushroom Dash" - UX Wireframe Documentation

## Overview
"Mushroom Dash" is a branded web mini-game for KinokoChocolate.com featuring the three mushroom characters: Leo (Lion's Mane), Remi (Reishi), and Spora (Cordyceps). The game offers a 30-60 second experience where players collect mushroom ingredients and Kinoko chocolate bars while avoiding obstacles. Each character has unique power-ups themed to their mushroom benefits.

## Game Flow and Screen Descriptions

### SCREEN 1: TITLE + CHARACTER SELECT
![Title Screen Wireframe]

**Elements:**
- **Background:** Stylized forest with faint mushroom silhouettes
- **Logo:** KINOKO logo prominently displayed at top center
- **Character Selection:** Three character cards showing:
  - Leo (Lion's Mane): Cream-colored fluffy character with "FOCUS" ability label
  - Remi (Reishi): Reddish-brown character with "SHIELD" ability label
  - Spora (Cordyceps): Vibrant yellow-orange character with "ENERGY" ability label
- **Start Button:** Large, chocolate-themed button below characters
- **Flavor Text:** "Choose your mushroom hero and dash for your daily dose!"
- **Weekly Prize Banner:** Small banner showing "Top 3 players win KINOKO chocolate!"

**Interactions:**
- Hovering over characters shows a brief animation and description of their power-up
- Clicking a character selects them and highlights their card
- Start button is only enabled after character selection

### SCREEN 2: GAMEPLAY (Side-Scroller)
![Gameplay Screen Wireframe]

**Elements:**
- **Background:** Horizontally scrolling forest/kitchen hybrid world with parallax effect (3 layers)
- **Player Character:** Animated sprite of selected character (using run animation)
- **Collectibles:**
  - 🧠 Brain icons (Lion's Mane benefit) - worth 5 points
  - 💖 Heart icons (Reishi benefit) - worth 5 points
  - ⚡ Energy bolt icons (Cordyceps benefit) - worth 5 points
  - 🍫 Kinoko chocolate bars - worth 15 points and trigger combo meter increase
- **Obstacles:**
  - Sugar cubes (small, frequent)
  - Soda cans (medium, occasional)
  - Coffee cups (large, rare)
- **UI Elements:**
  - Score counter (top left)
  - Time bar (top center) - 30-60 second countdown
  - Combo meter (top right) - fills as player collects items in succession
  - Pause button (corner)

**Interactions:**
- Tap/click to jump (or spacebar)
- Swipe/arrow keys to move up/down between three lanes
- Collecting items increases score and combo meter
- Hitting obstacles reduces combo meter and causes character to show "hurt" animation
- When combo meter is full, power-up is activated

### SCREEN 3: POWER-UP MOMENT (Triggered by Full Combo)
![Power-up Screen Wireframe]

**Elements:**
- **FX Overlay:** Sparkle burst animation and color-coded glow (blue for Leo, red for Remi, yellow for Spora)
- **Character Effect:** 
  - Leo: Speed boost with "focus" visual effect (brain icons worth double)
  - Remi: Shield aura that protects from next obstacle hit (heart icons worth double)
  - Spora: Double points for all collectibles for 5 seconds (energy icons worth double)
- **Text Banner:** Character-specific power-up announcement:
  - "FOCUS MODE ACTIVATED!" (Leo)
  - "SHIELD ACTIVATED!" (Remi)
  - "ENERGY BOOST ACTIVATED!" (Spora)

**Interactions:**
- Power-up automatically activates when combo meter is full
- Effect lasts for 5 seconds with countdown indicator
- Gameplay continues during power-up with enhanced abilities

### SCREEN 4: GAME END / SCORE
![Game End Screen Wireframe]

**Elements:**
- **Background:** Static version of gameplay scene with subtle blur effect
- **Score Display:** Large, centered display showing:
  - "🍫 You collected X Kinoko Points!"
  - Breakdown of items collected (brain, heart, energy, chocolate icons with counts)
- **Character Pose:** Selected character in celebration pose (from sprite sheet)
- **Buttons:**
  - "Play Again" - Primary button
  - "Share Score" - Secondary button with social media icons
  - "Enter Weekly Contest" - Highlighted button
- **Weekly Contest Banner:** "Top 3 players this week win a free Kinoko pack!"
- **Leaderboard Preview:** Small scrollable window showing top 5 scores of the week

**Interactions:**
- "Play Again" returns to character select screen
- "Share Score" opens share flow screen
- "Enter Weekly Contest" opens contact form overlay

### SCREEN 5: SHARE FLOW
![Share Flow Screen Wireframe]

**Elements:**
- **Screenshot Frame:** Auto-generated image of game results with character and score
- **Custom Message:** Editable text field with default "I scored X points in Mushroom Dash! 🍄💥"
- **Social Buttons:** Instagram, TikTok, Twitter icons
- **Copy Link Button:** For direct sharing
- **Bonus Entry Notice:** "+1 contest entry when you tag @kinokochocolate"
- **Return Button:** "Back to Game"

**Interactions:**
- Clicking social buttons opens respective sharing platform with pre-populated content
- Copy link button copies shareable URL to clipboard with confirmation message
- Return button goes back to score screen

### SCREEN 6: CONTEST ENTRY FORM
![Contest Entry Form Wireframe]

**Elements:**
- **Form Header:** "Enter to Win Weekly KINOKO Prize!"
- **Form Fields:**
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Shipping Address (required)
  - Checkbox for newsletter signup (optional)
  - Checkbox for terms acceptance (required)
- **Submit Button:** "Submit Entry"
- **Entry Counter:** Shows "You have X entries this week"
- **Privacy Notice:** Brief statement about data usage

**Interactions:**
- Form validates required fields before submission
- Successful submission shows confirmation message
- Entry counter updates based on score and social shares

## SPRITE USAGE MAP

| Game Moment | Sprite Source | Animation |
|-------------|--------------|-----------|
| Character Select | Idle animation | Looping idle frames |
| Running (main gameplay) | Running animation | Looping run frames |
| Jumping | Jump animation | Sequence: crouch → lift-off → mid-air → landing |
| Obstacle Hit | Hurt frame | Single frame + screen flash effect |
| Power-Up Activation | Celebration animation | First frame + custom effects |
| Game End | Celebration animation | Looping celebration frames |

## RESPONSIVE DESIGN NOTES

The game will adapt to different screen sizes with the following adjustments:

- **Mobile Portrait:** 
  - Single-tap controls
  - Vertically compressed play area
  - UI elements scaled appropriately

- **Mobile Landscape / Tablet:**
  - Optimal gameplay experience
  - Full visibility of background elements
  - Touch controls with larger hit areas

- **Desktop:**
  - Keyboard controls supported (spacebar, arrow keys)
  - Wider view of the game world
  - Enhanced visual effects

## TECHNICAL IMPLEMENTATION NOTES

- Game will be built using HTML5 Canvas and JavaScript
- Sprite sheets will be optimized for web performance
- Score and user data will be stored securely
- Weekly contest reset occurs every Monday at 00:00 UTC
- Social sharing will use platform-specific APIs where available
