import Phaser from 'phaser'
import { networkManager } from '../network/NetworkManager'
import { NetworkPlayer } from '../entities/NetworkPlayer'
import type { PlayerInput } from '@game/shared'

interface PlayerData {
  id: string
  x: number
  y: number
  color: string
  name: string
}

export class GameScene extends Phaser.Scene {
  private players: Map<string, NetworkPlayer> = new Map()
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>
  private inputSequence = 0

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      W: this.input.keyboard!.addKey('W'),
      A: this.input.keyboard!.addKey('A'),
      S: this.input.keyboard!.addKey('S'),
      D: this.input.keyboard!.addKey('D'),
      SPACE: this.input.keyboard!.addKey('SPACE')
    }

    // Listen for state changes
    networkManager.onStateChange((state) => {
      this.syncState(state)
    })

    networkManager.onPlayerJoin((sessionId) => {
      console.log('Player joined:', sessionId)
    })

    networkManager.onPlayerLeave((sessionId) => {
      console.log('Player left:', sessionId)
      this.removePlayer(sessionId)
    })

    // Instructions
    this.add.text(10, 10, 'WASD to move', {
      fontSize: '14px',
      color: '#ffffff'
    })
  }

  update() {
    // Gather input
    const input: PlayerInput = {
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
      action: this.wasd.SPACE.isDown,
      sequence: this.inputSequence++
    }

    // Send input to server
    if (input.left || input.right || input.up || input.down || input.action) {
      networkManager.sendInput(input)
    }

    // Update local player prediction
    const mySessionId = networkManager.getSessionId()
    if (mySessionId) {
      const myPlayer = this.players.get(mySessionId)
      if (myPlayer) {
        myPlayer.applyLocalInput(input)
      }
    }
  }

  private syncState(state: unknown) {
    const gameState = state as { players: Map<string, PlayerData> }

    // Sync all players
    gameState.players.forEach((playerData: PlayerData, sessionId: string) => {
      let player = this.players.get(sessionId)

      if (!player) {
        // Create new player
        player = new NetworkPlayer(
          this,
          playerData.x,
          playerData.y,
          playerData.color,
          playerData.name,
          sessionId === networkManager.getSessionId()
        )
        this.players.set(sessionId, player)
      }

      // Sync position (with interpolation for remote players)
      player.syncFromServer(playerData.x, playerData.y)
    })

    // Remove disconnected players
    this.players.forEach((_, sessionId) => {
      if (!gameState.players.has(sessionId)) {
        this.removePlayer(sessionId)
      }
    })
  }

  private removePlayer(sessionId: string) {
    const player = this.players.get(sessionId)
    if (player) {
      player.destroy()
      this.players.delete(sessionId)
    }
  }
}
