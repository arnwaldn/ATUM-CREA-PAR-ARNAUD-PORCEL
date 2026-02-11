import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'
import { LobbyScene } from './scenes/LobbyScene'
import { DEFAULT_CONFIG } from '@game/shared'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: DEFAULT_CONFIG.mapWidth,
  height: DEFAULT_CONFIG.mapHeight,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: import.meta.env.DEV
    }
  },
  scene: [LobbyScene, GameScene]
}

new Phaser.Game(config)
