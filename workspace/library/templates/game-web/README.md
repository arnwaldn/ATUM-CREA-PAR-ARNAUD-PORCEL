# Game Web Template

Phaser 3 game template with TypeScript and Vite.

## Quick Start

```bash
npm install
npm run dev
```

## Structure

```
src/
├── main.ts           # Game configuration
└── scenes/
    ├── Boot.ts       # Initial setup
    ├── Preloader.ts  # Asset loading with progress bar
    └── Game.ts       # Main game logic
```

## Scenes

1. **Boot** - Minimal setup, game settings
2. **Preloader** - Load all assets with progress bar
3. **Game** - Main gameplay

## Adding Assets

1. Create `public/assets/` folder
2. Add images, audio, spritesheets
3. Load in `Preloader.ts`:
   ```ts
   this.load.image('player', 'assets/player.png')
   ```

## Physics

Using Arcade Physics by default. Change in `main.ts` if needed:
- `arcade` - Simple, fast (recommended for 2D)
- `matter` - Complex physics, joints, constraints

## Build

```bash
npm run build
```

Output in `dist/` folder, ready for deployment.

---
*ULTRA-CREATE v21.0 Game Template*
