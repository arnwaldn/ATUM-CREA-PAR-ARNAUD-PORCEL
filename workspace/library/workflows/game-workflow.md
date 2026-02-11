# Game Workflow

## Objectif
Creer un jeu web complet (2D ou 3D) avec game loop, assets, scoring et deploy.

## Temps Realiste
- Jeu 2D simple (Phaser 3) : 20-35 min
- Jeu 3D (Three.js) : 30-50 min

## Stack

### 2D (Phaser 3)
```
Framework : Phaser 3.80+
Bundler   : Vite 6
Language  : TypeScript 5.7
Assets    : Kenney.nl / OpenGameArt
Audio     : Howler.js
Deploy    : Vercel / Cloudflare Pages
```

### 3D (Three.js)
```
Framework : Three.js r170+
Physics   : Rapier3D / Cannon-es
Bundler   : Vite 6
Language  : TypeScript 5.7
Shaders   : GLSL (custom)
Deploy    : Vercel / Cloudflare Pages
```

---

## Phase 1 : Research & Setup (3 min)

### MCPs Utilises
- Context7 : doc Phaser 3 ou Three.js a jour
- Memory MCP : patterns de jeu precedents

### Actions
1. Context7 : verifier API du framework cible
2. Creer le projet Vite + TypeScript
3. Installer les dependances (phaser / three)
4. Configurer le canvas et la resolution

### Output
- Projet initialise avec canvas fonctionnel

---

## Phase 2 : Game Architecture (5 min)

### Actions
1. Definir les scenes/etats du jeu :
   - Boot → Preload → Menu → Game → GameOver
2. Creer le game config :
   ```typescript
   const config: Phaser.Types.Core.GameConfig = {
     type: Phaser.AUTO,
     width: 800,
     height: 600,
     physics: { default: 'arcade', arcade: { gravity: { y: 300 } } },
     scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene]
   };
   ```
3. Definir les entites du jeu (Player, Enemy, Collectible, Obstacle)
4. Planifier le systeme de scoring et progression

### Output
- Architecture de scenes definie
- Entites et leurs proprietes documentees

---

## Phase 3 : Core Gameplay (10-20 min)

### Actions
1. **Player Controller**
   - Input handling (keyboard/touch)
   - Physics body et collisions
   - Animations (idle, run, jump, attack)

2. **Game Mechanics**
   - Spawn system pour ennemis/items
   - Collision groups et overlap detection
   - Score, vies, timer
   - Difficulte progressive

3. **Level Design**
   - Tilemap ou generation procedurale
   - Spawn points et zones de trigger
   - Parallax background (2D)

4. **Audio**
   - Background music (loop)
   - SFX (jump, collect, hit, game over)

### Output
- Gameplay jouable avec mecaniques de base

---

## Phase 4 : UI & Polish (5-10 min)

### Actions
1. **HUD**
   - Score display
   - Health/lives indicator
   - Timer (si applicable)
   - Minimap (si applicable)

2. **Menus**
   - Menu principal avec start/options
   - Ecran pause
   - Game Over avec score + replay

3. **Visual Polish**
   - Particle effects (explosion, trail, collect)
   - Screen shake sur impact
   - Transitions entre scenes
   - Responsive canvas scaling

### Output
- Jeu complet avec UI et effets visuels

---

## Phase 5 : Test & Deploy (3 min)

### MCPs Utilises
- AI Browser : test visuel du jeu
- Vercel / Cloudflare : deploy

### Actions
1. Test cross-browser (Chrome, Firefox, Safari)
2. Test mobile (touch controls)
3. Performance check (60 FPS stable)
4. Build production (`vite build`)
5. Deploy sur Vercel ou Cloudflare Pages

### Output
- Jeu deploye et accessible en ligne

---

## Structure Finale (2D Phaser)

```
src/
├── main.ts                  # Entry point + game config
├── scenes/
│   ├── BootScene.ts         # Logo + init
│   ├── PreloadScene.ts      # Asset loading
│   ├── MenuScene.ts         # Main menu
│   ├── GameScene.ts         # Core gameplay
│   └── GameOverScene.ts     # Score + replay
├── entities/
│   ├── Player.ts            # Player sprite + controls
│   ├── Enemy.ts             # Enemy AI + behavior
│   └── Collectible.ts       # Items + power-ups
├── ui/
│   ├── HUD.ts               # In-game UI overlay
│   └── Button.ts            # Reusable button component
├── utils/
│   ├── ScoreManager.ts      # Score persistence
│   └── AudioManager.ts      # Sound management
├── assets/
│   ├── sprites/             # Character + object sprites
│   ├── tilemaps/            # Level tilemaps (JSON)
│   └── audio/               # Music + SFX
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Checklist
- [ ] Canvas responsive (desktop + mobile)
- [ ] 60 FPS stable sur Chrome
- [ ] Touch controls fonctionnels
- [ ] Audio fonctionne (avec user interaction pour autoplay)
- [ ] Score persiste (localStorage)
- [ ] Build production sans erreurs

---

**Workflow:** Game | **Temps:** 20-50 min | **Stack:** Phaser 3 / Three.js + Vite + TypeScript
