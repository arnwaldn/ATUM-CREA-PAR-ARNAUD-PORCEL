import Phaser from 'phaser'

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' })
  }

  preload(): void {
    // Create loading bar
    const { width, height } = this.cameras.main

    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0x00ff88, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
      percentText.setText(`${Math.floor(value * 100)}%`)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })

    // Load game assets here
    // this.load.image('player', 'assets/player.png')
    // this.load.spritesheet('enemies', 'assets/enemies.png', { frameWidth: 32, frameHeight: 32 })
    // this.load.audio('bgm', 'assets/music.mp3')
  }

  create(): void {
    // Create animations here
    // this.anims.create({ ... })

    // Start game
    this.scene.start('Game')
  }
}
