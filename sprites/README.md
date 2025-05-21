# KINOKO Game Sprite Sheets

## Overview

This package contains complete sprite sheets for the KINOKO mushroom characters for a 2D side-scrolling platformer game. Each character has been rendered in a clean, flat 2D digital style with a soft, cartoonish aesthetic inspired by Studio Ghibli, Nintendo, and Cuphead.

## Characters

### Leo the Lion's Mane
A fluffy cream-colored mushroom character with a mane-like appearance, big eyes, and a cute smile.

### Remi the Reishi
A reddish-brown mushroom with a wide cap, small arms and legs, big eyes, and a gentle smile.

### Spora the Cordyceps
A vibrant yellow-orange mushroom with finger-like projections on top, small arms and legs, big eyes, and an energetic smile.

## Animation Sets

Each character includes the following animations:

1. **Idle/Standing** (3-4 frames)
   - Subtle loopable animation showing the character at rest with slight bouncing motion

2. **Walking** (6-8 frames)
   - Side-view animation with bounce and clear leg motion
   - Perfect for basic horizontal movement

3. **Running** (6-8 frames)
   - Faster posture with motion blur accents
   - Exaggerated forward lean for dynamic movement

4. **Jumping** (3-4 frames)
   - Complete jump cycle: crouch, lift-off, air, and landing
   - Expressive poses that convey momentum

5. **Celebration** (2-3 frames)
   - Victory animations showing excitement
   - Includes chocolate-holding frame for reward moments

6. **Hurt** (1 frame)
   - Dazed, knocked-back reaction
   - Includes dizzy spiral eyes and stars for impact feedback

## Technical Specifications

- **Frame Size**: 256x256 pixels
- **Format**: PNG with transparent background
- **Layout**: Horizontal sprite sheets (all frames in a row)
- **Frame Spacing**: Uniform for easy game engine import

## Implementation Notes

1. Each animation is provided as a separate sprite sheet file for easy implementation
2. All frames maintain consistent proportions and style across animations
3. Character silhouettes are designed for high readability during gameplay
4. Transparent backgrounds allow for placement over any game environment

## File Naming Convention

Files are named using the following pattern:
`[character_name]_[animation_type].png`

Example: `leo_walking.png`

## Credits

Created for KINOKO by Manus AI, based on character designs by the KINOKO team.
