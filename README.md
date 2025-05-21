# KINOKO "Mushroom Dash" Mini-Game

## Overview

This package contains all assets and documentation for the "Mushroom Dash" mini-game for KinokoChocolate.com. The game features the three KINOKO mushroom characters (Leo, Remi, and Spora) in a side-scrolling adventure where players collect mushroom ingredients and chocolate bars while dodging obstacles.

## Directory Structure

- `/backgrounds/` - Layered background images for forest and kitchen scenes
- `/collectibles/` - Collectible item icons (brain, heart, energy, chocolate)
- `/obstacles/` - Obstacle icons (sugar cube, soda can, coffee cup)
- `/ui/` - User interface elements (leaderboard, share flow)
- `/sprites/` - Character sprite sheets (from previous task)
- `ux_wireframe.md` - Complete UX documentation and game flow
- `score_capture_scripts.js` - Scripts for score tracking and contest entry
- `sprite_integration_guide.md` - Instructions for using character sprites

## Game Features

- **30-60 Second Gameplay**: Fast-paced side-scrolling action
- **Character Selection**: Players choose between Leo, Remi, or Spora
- **Unique Power-ups**: Each character has special abilities based on their mushroom benefits
- **Weekly Contest**: Top 3 players win real KINOKO chocolate boxes
- **Social Sharing**: Bonus contest entries for social media shares

## Implementation Notes

1. The backgrounds are provided as separate layers for parallax scrolling effects
2. All collectibles and obstacles have transparent backgrounds for easy integration
3. The UI elements are designed to match the KINOKO brand aesthetic
4. The score capture scripts include leaderboard management and contest entry functionality
5. Character sprites (from previous task) should be integrated according to the sprite guide

## Technical Requirements

- HTML5 Canvas for rendering
- JavaScript for game logic
- Local storage for score persistence
- Server-side component for leaderboard and contest management (implementation details in scripts)

## Credits

Created for KINOKO by Manus AI, based on the KINOKO mushroom characters and brand guidelines.
