import { Room, Client } from 'colyseus'
import { GameState, Player } from '../schemas/GameState.js'
import { DEFAULT_CONFIG, type PlayerInput, MessageType } from '@game/shared'

export class GameRoom extends Room<GameState> {
  private tickInterval: NodeJS.Timeout | null = null

  onCreate(options: Record<string, unknown>) {
    console.log('GameRoom created:', options)

    this.setState(new GameState())
    this.maxClients = DEFAULT_CONFIG.maxPlayers

    // Handle player input
    this.onMessage(MessageType.PLAYER_INPUT, (client, input: PlayerInput) => {
      const player = this.state.players.get(client.sessionId)
      if (player) {
        this.processInput(player, input)
      }
    })

    // Handle chat
    this.onMessage(MessageType.CHAT_MESSAGE, (client, message: string) => {
      const player = this.state.players.get(client.sessionId)
      if (player) {
        this.broadcast(MessageType.CHAT_MESSAGE, {
          playerId: client.sessionId,
          playerName: player.name,
          message,
          timestamp: Date.now()
        })
      }
    })

    // Start game loop
    this.startGameLoop()
  }

  onJoin(client: Client, options: { name?: string; color?: string }) {
    console.log('Player joined:', client.sessionId)

    const player = new Player()
    player.id = client.sessionId
    player.name = options.name ?? `Player ${this.state.players.size + 1}`
    player.color = options.color ?? this.getRandomColor()
    player.x = Math.random() * DEFAULT_CONFIG.mapWidth
    player.y = Math.random() * DEFAULT_CONFIG.mapHeight

    this.state.players.set(client.sessionId, player)
  }

  onLeave(client: Client, _consented: boolean) {
    console.log('Player left:', client.sessionId)
    this.state.players.delete(client.sessionId)
  }

  onDispose() {
    console.log('GameRoom disposed')
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
    }
  }

  private startGameLoop() {
    const tickRate = 1000 / DEFAULT_CONFIG.tickRate

    this.tickInterval = setInterval(() => {
      this.update(tickRate / 1000)
    }, tickRate)
  }

  private update(delta: number) {
    this.state.players.forEach((player) => {
      // Apply velocity
      player.x += player.velocityX * delta
      player.y += player.velocityY * delta

      // Apply friction
      player.velocityX *= 0.9
      player.velocityY *= 0.9

      // Clamp to map bounds
      player.x = Math.max(0, Math.min(DEFAULT_CONFIG.mapWidth, player.x))
      player.y = Math.max(0, Math.min(DEFAULT_CONFIG.mapHeight, player.y))
    })
  }

  private processInput(player: Player, input: PlayerInput) {
    const speed = DEFAULT_CONFIG.playerSpeed

    if (input.left) player.velocityX -= speed * 0.1
    if (input.right) player.velocityX += speed * 0.1
    if (input.up) player.velocityY -= speed * 0.1
    if (input.down) player.velocityY += speed * 0.1
  }

  private getRandomColor(): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9']
    return colors[Math.floor(Math.random() * colors.length)]
  }
}
