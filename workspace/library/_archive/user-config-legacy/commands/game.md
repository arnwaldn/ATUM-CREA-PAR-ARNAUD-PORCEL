---
description: Game development multi-engines (user)
---

# /game - Game Development

## USAGE
```
/game simple "Jeu de snake en Phaser"
/game web "Platformer 2D avec Three.js"
/game unity "RPG top-down avec Unity"
/game godot "Puzzle game avec Godot"
/game design "Game Design Document pour MMO"
```

## MODES

### simple
Jeux web rapides (Phaser 3, vanilla JS)
```
/game simple "Flappy bird clone"
```
Output: Projet Phaser 3 complet

### web
Jeux web avances (Three.js, Babylon.js)
```
/game web "3D racing game"
```
Output: Projet Three.js avec assets

### unity
Projets Unity (C#)
```
/game unity "FPS multiplayer"
```
Output: Scripts C# + scene setup

### godot
Projets Godot (GDScript)
```
/game godot "Metroidvania 2D"
```
Output: Scripts GD + scene structure

### design
Game Design Document
```
/game design "Battle royale concept"
```
Output: GDD complet

## ENGINES DISPONIBLES

| Engine | Type | Fichier |
|--------|------|---------|
| **Phaser 3** | Web 2D | `templates/game-web/` |
| **Three.js** | Web 3D | `templates/game-web/` |
| **Unity** | Native | Versions 2022.3, 6000.x |
| **Godot** | Native | Via MCP |
| **Blender** | Assets 3D | Scripts prets |

## WORKFLOW

### 1. Analyse concept
```yaml
game_concept:
  genre: platformer
  perspective: 2d_side
  core_mechanics: [jump, collect, enemies]
  estimated_scope: small/medium/large
```

### 2. Architecture
```yaml
architecture:
  engine: phaser
  scenes: [menu, game, gameover]
  entities: [player, enemy, collectible]
  systems: [physics, input, scoring]
```

### 3. Implementation
Pour chaque systeme:
- Context7 docs engine
- Code generation
- Asset placeholders

### 4. Testing
- Gameplay loop verification
- Performance check
- Bug identification

## EXEMPLE PHASER

```javascript
// game.js
import Phaser from 'phaser'

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  preload() {
    this.load.image('player', 'assets/player.png')
  }

  create() {
    this.player = this.physics.add.sprite(400, 300, 'player')
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
    }
  }
}
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --template=X | Utiliser template existant |
| --assets | Generer assets placeholders |
| --multiplayer | Ajouter networking |
| --mobile | Optimiser pour mobile |

## MCP UTILISES
- Context7 (docs Phaser, Three.js)
- GitHub (exemples repos)
- filesystem (creation fichiers)
