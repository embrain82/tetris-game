# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fully functional web-based Tetris game implementation using Vanilla JavaScript and Canvas API. The game includes all core features plus advanced enhancements like AI hints and visual effects.

**Implementation Status**: Phase 1-2 complete, Phase 3 partially complete with bonus features.

## Game Requirements (from prd.md)

### Core Game Specifications
- **Game Board**: 10x20 grid (10 columns, 20 rows)
- **Tetromino Types**: 7 standard pieces (I, O, T, L, J, S, Z blocks) with specific colors
- **Scoring System**:
  - 1 line: 100 points
  - 2 lines: 300 points
  - 3 lines: 500 points
  - 4 lines (Tetris): 800 points
  - Soft drop: 1 point per cell
  - Hard drop: 2 points per cell
- **Level System**: Level increases every 10 lines cleared
- **Drop Speed Formula**: `speed = 1000ms - (level × 50ms)` (minimum 100ms)

### Key Game Mechanics
- Auto-drop with speed scaling
- Line clearing with gravity
- Hold functionality (one-time use per piece)
- Next piece preview (1-3 pieces)
- Soft drop (faster descent) and hard drop (instant placement)
- Wall kick handling for rotations

### Controls Specification (Implemented)
- **Movement**: Arrow keys (←→) or A/D
- **Rotation**: Arrow up (↑) or W
- **Soft Drop**: Arrow down (↓) or S
- **Hard Drop**: Space bar
- **Hold**: C or Shift keys
- **Hint**: H key (5 uses per game)
- **Pause**: P or ESC
- **Restart**: R key (during pause)

### Performance Requirements
- **Frame Rate**: Maintain 60 FPS
- **Input Latency**: Under 16ms
- **Load Time**: Under 3 seconds
- **File Size**: Total under 3MB

### Technology Stack (Implemented)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Rendering**: Canvas API (300x600px main board, multiple preview canvases)
- **No external dependencies** - fully self-contained
- **Offline-capable** - runs locally without internet
- **File Structure**:
  - `index.html` - Main HTML structure with layout
  - `style.css` - Styling, animations, responsive design
  - `game.js` - Game logic, AI algorithm, rendering (~1000 lines)

## Implementation Status

### ✅ Phase 1 (MVP) - COMPLETE
1. ✅ Game board rendering (Canvas-based, 10x20 grid)
2. ✅ All 7 tetromino types with rotation states
3. ✅ Movement, rotation with Wall Kick support
4. ✅ Line clearing with gravity
5. ✅ Full scoring system (soft/hard drop bonuses)
6. ✅ Game over detection and restart

### ✅ Phase 2 (Core Features) - COMPLETE
1. ✅ Level system (speed increases every 10 lines)
2. ✅ Next 3 pieces preview
3. ✅ Hold functionality (C/Shift key)
4. ✅ Pause with menu UI (P/ESC key)
5. ✅ Polished UI with overlays and buttons

### 🔄 Phase 3 (Enhancements) - PARTIAL
1. ✅ Ghost block (always visible)
2. ❌ Sound effects/music (not implemented)
3. ❌ LocalStorage high scores (not implemented)
4. ✅ Responsive design (desktop/tablet)
5. ❌ Mobile touch controls (not implemented)

### ✨ Phase 4 (Bonus Features) - COMPLETE
1. ✅ **Line Clear Animations**:
   - Flash effect (color varies by line count)
   - Particle effects (20-80 particles based on lines cleared)
   - 4-line Tetris shows rainbow particles

2. ✅ **AI Hint System**:
   - Press H for optimal placement suggestion
   - 5 hints per game
   - Evaluates: hole minimization, height, flatness, line completion
   - Shows green translucent preview for 3 seconds

3. ✅ **Enhanced Pause Menu**:
   - Interactive buttons (Continue/Restart)
   - R key for quick restart during pause

4. ✅ **Improved UX**:
   - Blocks hidden before game start
   - Game over shows final stats
   - Visual feedback for all actions

## Development Commands

```bash
# Start local server
python3 -m http.server 8000

# Access game
# Open http://localhost:8000 in browser
```

## Testing Focus Areas

Implemented and tested:
- ✅ All 7 tetromino types with proper rotation
- ✅ Wall kick at boundaries (shift left/right if rotation blocked)
- ✅ Multiple simultaneous line clears (up to 4)
- ✅ Rapid input handling (no lag or dropped inputs)
- ✅ Accurate score calculation including drop bonuses
- ✅ 60 FPS maintained during particle effects

Needs testing:
- Memory leaks during extended play (no issues observed)
- Very high level performance (tested to level 10+)

## Code Architecture

### Main Game Loop (`gameLoop`)
- Runs at 60 FPS via `requestAnimationFrame`
- Updates particle physics
- Handles auto-drop timing based on level
- Renders board, pieces, and effects

### Key Data Structures
```javascript
game = {
  board: Array(20).fill(Array(10)),  // 2D grid
  currentPiece, currentX, currentY, currentRotation,
  holdPiece, canHold,
  nextPieces: [piece1, piece2, piece3],
  score, level, lines,
  hintsRemaining: 5,
  showingHint, hintPosition,
  particles: [Particle instances],
  animating: boolean  // Pauses input during line clear
}
```

### Core Functions
- **Collision Detection**: `collision(x, y, rotation, piece)` - Checks board boundaries and occupied cells
- **Line Clearing**: `clearLines()` - Async function with animation
- **AI Evaluation**: `evaluateBoard(board)` - Scores board state considering holes, height, flatness
- **Best Position**: `findBestPosition()` - Tests all rotations/positions, returns optimal placement

### Rendering Pipeline
1. `drawBoard()` - Main canvas (board + current piece + ghost + hint + particles)
2. `drawHold()` - Hold canvas (left sidebar)
3. `drawNext()` - 3 preview canvases (right sidebar)
4. `drawPieceOnCanvas()` - Utility for drawing pieces on small canvases

### Animation System
- **Line Clear**: 400ms flash animation with color based on line count
- **Particles**: Physics-based with velocity, gravity, life decay
- **Hints**: 3-second green translucent overlay

## UI Layout (Implemented)

Left Sidebar:
- HOLD canvas (120x120px)
- SCORE display
- LEVEL display
- LINES display
- HINTS display (green highlight)

Center:
- Game board canvas (300x600px)
- Overlays for start/pause/game over

Right Sidebar:
- 3 NEXT canvases (120x120px each)

Bottom:
- Controls guide

## Important Implementation Details

### Collision Detection
The `collision()` function accepts an optional `piece` parameter (defaults to `game.currentPiece`). This is crucial for the AI hint system which needs to test collisions for the current piece without modifying game state.

### Async Line Clearing
`clearLines()` is async because it:
1. Animates flash effect (400ms)
2. Creates particles
3. Removes lines
4. Updates score/level

During animation, `game.animating = true` blocks user input and auto-drop.

### AI Hint Algorithm
Evaluates each possible position/rotation by:
- Placing piece virtually on test board
- Scoring based on:
  - Completed lines: +100 per line
  - Holes (blocks with empty space below): -50 per hole
  - Max height: -10 per row
  - Bumpiness (height differences): -5 per unit
  - Wall/floor contact: +2 per contact

Returns position with highest score.

### Game State Management
- `game.started`: Controls whether game is active
- `game.paused`: Pause state
- `game.animating`: Blocks input during line clear
- NEXT/HOLD only render when `game.started === true`

### Particle System
Each `Particle` has:
- Position (x, y)
- Velocity (vx, vy) with random variation
- Gravity (0.1)
- Life (1.0 → 0, then removed)
- Color (based on line count)
- Size (3-11px based on line count)

## Known Limitations

- No mobile touch controls
- No sound/music
- No persistent high score storage
- Hints use simple heuristic (not perfect play)

## Future Enhancement Ideas

1. Add sound effects using Web Audio API
2. Implement localStorage for high scores
3. Add touch controls for mobile
4. Improve AI with look-ahead (evaluate next piece too)
5. Add combo multiplier for consecutive line clears
6. Add T-spin detection and bonus points
