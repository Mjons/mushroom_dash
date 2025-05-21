# Sprite Usage Map and Integration Guide for Mushroom Dash

## Overview

This document provides detailed instructions for integrating the character sprite sheets into the Mushroom Dash game. The sprites were created specifically for this game and feature the three KINOKO mushroom characters: Leo (Lion's Mane), Remi (Reishi), and Spora (Cordyceps).

## Sprite Sheet Organization

All sprite sheets are located in the `/kinoko_sprites/` directory and follow this naming convention:
- `[character_name]_[animation_type].png`

For example: `leo_walking.png`

Each sprite sheet contains multiple frames arranged horizontally in a row, with each frame sized at 256x256 pixels with transparent backgrounds.

## Character Sprites

### Leo (Lion's Mane)
- **Description**: Fluffy cream-colored character with a mane-like appearance
- **Sprite Files**:
  - `leo_idle.png` - 4 frames
  - `leo_walking.png` - 6 frames
  - `leo_running.png` - 6 frames
  - `leo_jumping.png` - 4 frames
  - `leo_celebration.png` - 3 frames
  - `leo_hurt.png` - 1 frame
- **Special Power**: Focus Mode (brain icons worth double)

### Remi (Reishi)
- **Description**: Reddish-brown mushroom with a wide cap
- **Sprite Files**:
  - `remi_idle.png` - 4 frames
  - `remi_walking.png` - 6 frames
  - `remi_running.png` - 6 frames
  - `remi_jumping.png` - 4 frames
  - `remi_celebration.png` - 3 frames
  - `remi_hurt.png` - 1 frame
- **Special Power**: Shield (protects from next obstacle hit)

### Spora (Cordyceps)
- **Description**: Vibrant yellow-orange character with finger-like projections
- **Sprite Files**:
  - `spora_idle.png` - 4 frames
  - `spora_walking.png` - 6 frames
  - `spora_running.png` - 6 frames
  - `spora_jumping.png` - 4 frames
  - `spora_celebration.png` - 3 frames
  - `spora_hurt.png` - 1 frame
- **Special Power**: Energy Boost (double points for all collectibles)

## Animation Usage Map

This section details when and how to use each animation during gameplay:

| Game Moment | Sprite Source | Animation Frames | Implementation Notes |
|-------------|---------------|------------------|----------------------|
| Character Select Screen | Idle animation | All frames (looping) | Display all three characters in idle animation; highlight selected character |
| Running (main gameplay) | Running animation | All frames (looping) | Main animation during gameplay; use faster frame rate for higher game speeds |
| Jumping | Jump animation | Sequential playback | Frame 1: crouch (on button press)<br>Frame 2: lift-off (rising)<br>Frame 3: mid-air (apex)<br>Frame 4: landing (returning to ground) |
| Obstacle Hit | Hurt frame | Single frame | Display for 500ms, add screen shake and flash effect |
| Power-Up Activation | Celebration animation | First frame + effects | Add character-specific glow effect (Leo: blue, Remi: red, Spora: yellow) |
| Game End | Celebration animation | All frames (looping) | Display on score screen with appropriate character |

## Frame Extraction

To extract individual frames from the sprite sheets, use the following calculations:

```javascript
// Example code for extracting frames from sprite sheets
function extractFrame(spriteSheet, frameIndex, frameWidth, frameHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = frameWidth;
  canvas.height = frameHeight;
  
  // Draw the specific frame from the sprite sheet
  ctx.drawImage(
    spriteSheet,
    frameIndex * frameWidth, 0,      // Source position (x, y)
    frameWidth, frameHeight,         // Source dimensions
    0, 0,                            // Destination position
    frameWidth, frameHeight          // Destination dimensions
  );
  
  return canvas;
}

// Usage example
const leoRunFrames = [];
const leoRunSheet = new Image();
leoRunSheet.src = '/kinoko_sprites/leo_running.png';
leoRunSheet.onload = () => {
  // Extract all 6 frames
  for (let i = 0; i < 6; i++) {
    leoRunFrames.push(extractFrame(leoRunSheet, i, 256, 256));
  }
};
```

## Animation Timing

Recommended frame rates for smooth animation:

- **Idle**: 4 FPS (slow, subtle movement)
- **Walking**: 8 FPS (moderate pace)
- **Running**: 12 FPS (fast-paced action)
- **Jumping**: Timing based on jump arc physics
- **Celebration**: 6 FPS (playful, bouncy feel)
- **Hurt**: Single frame with 500ms display duration

## Character Selection Implementation

When implementing the character selection screen:

1. Display all three characters side by side using their idle animations
2. When a character is hovered over, increase animation speed slightly
3. When selected, play the celebration animation once, then return to idle
4. Store the selected character for use throughout gameplay

## Power-Up Implementation

Each character has a unique power-up that activates when the combo meter is full:

1. **Leo (Lion's Mane) - Focus Mode**:
   - Visual Effect: Blue glow around character
   - Gameplay Effect: Brain collectibles worth double points
   - Duration: 5 seconds
   - Animation: Use first frame of celebration + blue particle effects

2. **Remi (Reishi) - Shield**:
   - Visual Effect: Red protective aura
   - Gameplay Effect: Protects from next obstacle hit
   - Duration: Until hit or 10 seconds
   - Animation: Use first frame of celebration + red shield effect

3. **Spora (Cordyceps) - Energy Boost**:
   - Visual Effect: Yellow speed lines and glow
   - Gameplay Effect: All collectibles worth double points
   - Duration: 5 seconds
   - Animation: Use running animation at 1.5x speed + yellow trail effect

## Sprite Scaling

The sprites are designed at 256x256 pixels but can be scaled as needed:

- For mobile devices: Scale to 128x128 or 160x160 depending on screen size
- For desktop: Original 256x256 or larger for high-resolution displays
- Maintain aspect ratio when scaling to prevent distortion

## Optimization Tips

1. **Preload all sprite sheets** at game initialization to prevent loading delays during gameplay
2. **Use sprite sheet caching** to improve performance
3. **Implement frame skipping** for lower-end devices
4. **Use hardware acceleration** when available

## Integration with Score System

The character selection affects scoring through power-ups:

```javascript
// Example integration with scoring system
function activatePowerUp(characterType) {
  switch(characterType) {
    case 'leo':
      // Lion's Mane - Focus power
      // Implementation in score_capture_scripts.js
      return 'focus';
    case 'remi':
      // Reishi - Shield power
      // Implementation in score_capture_scripts.js
      return 'shield';
    case 'spora':
      // Cordyceps - Energy power
      // Implementation in score_capture_scripts.js
      return 'energy';
  }
}
```

## Additional Notes

- All sprites have consistent proportions and hitboxes for gameplay fairness
- Character selection should not affect game difficulty, only power-up types
- For best visual results, implement subtle squash and stretch effects during jumps and landings
- Add particle effects that match each character's theme (Leo: sparkles, Remi: calm waves, Spora: energy bursts)
