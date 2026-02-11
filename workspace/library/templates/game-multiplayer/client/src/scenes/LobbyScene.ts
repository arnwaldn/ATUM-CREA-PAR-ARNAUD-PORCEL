import Phaser from 'phaser'
import { networkManager } from '../network/NetworkManager'

export class LobbyScene extends Phaser.Scene {
  private playerName = 'Player'
  private statusText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'LobbyScene' })
  }

  create() {
    const { width, height } = this.cameras.main

    // Title
    this.add.text(width / 2, 80, 'MULTIPLAYER GAME', {
      fontSize: '48px',
      color: '#4ecdc4',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Instructions
    this.add.text(width / 2, 150, 'Enter your name and click Play!', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Name input prompt
    this.add.text(width / 2, 250, 'Your Name:', {
      fontSize: '20px',
      color: '#96ceb4'
    }).setOrigin(0.5)

    // Play button
    const playButton = this.add.rectangle(width / 2, 350, 200, 50, 0x4ecdc4)
      .setInteractive({ useHandCursor: true })

    const playText = this.add.text(width / 2, 350, 'PLAY', {
      fontSize: '24px',
      color: '#1a1a2e',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    playButton.on('pointerover', () => {
      playButton.setFillStyle(0x45b7d1)
    })

    playButton.on('pointerout', () => {
      playButton.setFillStyle(0x4ecdc4)
    })

    playButton.on('pointerdown', () => {
      this.joinGame()
    })

    // Status text
    this.statusText = this.add.text(width / 2, 450, '', {
      fontSize: '16px',
      color: '#ffeaa7'
    }).setOrigin(0.5)

    // Prompt for name
    this.promptName()
  }

  private promptName() {
    const name = prompt('Enter your name:', 'Player')
    if (name) {
      this.playerName = name.substring(0, 16)
    }
  }

  private async joinGame() {
    this.statusText.setText('Connecting to server...')

    try {
      await networkManager.joinGame(this.playerName)
      this.scene.start('GameScene', { playerName: this.playerName })
    } catch (error) {
      console.error('Failed to join game:', error)
      this.statusText.setText('Failed to connect. Is the server running?')
    }
  }
}
