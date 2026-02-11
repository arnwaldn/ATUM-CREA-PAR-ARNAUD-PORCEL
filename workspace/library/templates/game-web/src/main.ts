import Phaser from 'phaser'
import { BootScene } from './scenes/Boot'
import { PreloaderScene } from './scenes/Preloader'
import { GameScene } from './scenes/Game'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: import.meta.env.DEV
    }
  },
  scene: [BootScene, PreloaderScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: false,
  antialias: true
}

new Phaser.Game(config)
