# Tetris Game

A fully functional web-based Tetris game built with Vanilla JavaScript and Canvas API.

## Play Now

🎮 **[Play the game here!](https://embrain82.github.io/tetris-game/)**

## Features

### Core Gameplay
- ✅ Classic 10x20 Tetris board
- ✅ All 7 tetromino types with proper rotation
- ✅ Wall kick mechanics
- ✅ Ghost block (landing position preview)
- ✅ Hold functionality (C or Shift key)
- ✅ Next 3 pieces preview

### Scoring System
- Points for line clears: 100 / 300 / 500 / 800 (1-4 lines)
- Soft drop: 1 point per cell
- Hard drop: 2 points per cell
- Level increases every 10 lines cleared
- Speed increases with level (min 100ms)

### Visual Effects
- 🎨 Line clear animations (flash effect)
- ✨ Particle effects (20-80 particles based on lines cleared)
- 🌈 Rainbow particles for 4-line Tetris clears

### AI Hint System
- 💡 Press **H** for optimal placement suggestion (5 hints per game)
- AI evaluates: hole minimization, height, flatness, line completion
- Green translucent preview shows best position for 3 seconds

### Enhanced UX
- Pause menu with interactive buttons
- Quick restart during pause (R key)
- Responsive design for desktop and tablet
- Smooth animations at 60 FPS

## Controls

| Action | Keys |
|--------|------|
| Move Left/Right | ← → or A/D |
| Rotate | ↑ or W |
| Soft Drop | ↓ or S |
| Hard Drop | Space |
| Hold | C or Shift |
| Hint | H (5 per game) |
| Pause | P or ESC |
| Restart (in pause) | R |

## How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/embrain82/tetris-game.git
cd tetris-game
```

2. Start a local server:
```bash
python3 -m http.server 8000
# or
npx serve
```

3. Open in browser:
```
http://localhost:8000
```

## Technical Details

- **Framework**: Vanilla JavaScript (ES6+)
- **Rendering**: Canvas API
- **No external dependencies**
- **Offline-capable**
- **File size**: < 100KB total

### Code Structure
- `index.html` - Main HTML structure
- `style.css` - Styling and responsive design
- `game.js` - Game logic, AI algorithm, rendering

### AI Algorithm
The hint system evaluates each possible position/rotation:
- Completed lines: +100 per line
- Holes (empty spaces below blocks): -50 per hole
- Max height: -10 per row
- Bumpiness (height differences): -5 per unit
- Wall/floor contact: +2 per contact

## Screenshots

### Gameplay
![Tetris Gameplay](https://via.placeholder.com/600x400?text=Gameplay+Screenshot)

### Line Clear Effect
![Line Clear Animation](https://via.placeholder.com/600x400?text=Line+Clear+Effect)

## Future Enhancements

- [ ] Sound effects and background music
- [ ] LocalStorage for high score persistence
- [ ] Mobile touch controls
- [ ] Combo multiplier for consecutive clears
- [ ] T-spin detection and bonus points

## License

MIT License - Feel free to use this code for learning or personal projects!

## Acknowledgments

Built as a practice project to demonstrate:
- Canvas API rendering
- Game loop architecture
- AI heuristic algorithms
- Smooth animations and effects
- Responsive web design

---

Made with ❤️ using Vanilla JavaScript
