import { Room, Client } from 'colyseus'
import { Schema, MapSchema, type } from '@colyseus/schema'

class LobbyPlayer extends Schema {
  @type('string') id: string = ''
  @type('string') name: string = ''
  @type('boolean') ready: boolean = false
}

class LobbyState extends Schema {
  @type({ map: LobbyPlayer }) players = new MapSchema<LobbyPlayer>()
  @type('boolean') gameStarting: boolean = false
  @type('number') countdown: number = 0
}

export class LobbyRoom extends Room<LobbyState> {
  private countdownInterval: NodeJS.Timeout | null = null

  onCreate() {
    console.log('LobbyRoom created')
    this.setState(new LobbyState())
    this.maxClients = 8

    this.onMessage('ready', (client) => {
      const player = this.state.players.get(client.sessionId)
      if (player) {
        player.ready = !player.ready
        this.checkAllReady()
      }
    })

    this.onMessage('chat', (client, message: string) => {
      const player = this.state.players.get(client.sessionId)
      if (player) {
        this.broadcast('chat', {
          playerId: client.sessionId,
          playerName: player.name,
          message
        })
      }
    })
  }

  onJoin(client: Client, options: { name?: string }) {
    console.log('Player joined lobby:', client.sessionId)

    const player = new LobbyPlayer()
    player.id = client.sessionId
    player.name = options.name ?? `Player ${this.state.players.size + 1}`
    player.ready = false

    this.state.players.set(client.sessionId, player)

    this.broadcast('playerJoined', {
      id: client.sessionId,
      name: player.name
    })
  }

  onLeave(client: Client) {
    console.log('Player left lobby:', client.sessionId)

    const player = this.state.players.get(client.sessionId)
    if (player) {
      this.broadcast('playerLeft', {
        id: client.sessionId,
        name: player.name
      })
    }

    this.state.players.delete(client.sessionId)

    // Cancel countdown if not enough players
    if (this.state.gameStarting && this.state.players.size < 2) {
      this.cancelCountdown()
    }
  }

  private checkAllReady() {
    if (this.state.players.size < 2) return

    let allReady = true
    this.state.players.forEach((player) => {
      if (!player.ready) allReady = false
    })

    if (allReady && !this.state.gameStarting) {
      this.startCountdown()
    } else if (!allReady && this.state.gameStarting) {
      this.cancelCountdown()
    }
  }

  private startCountdown() {
    this.state.gameStarting = true
    this.state.countdown = 5

    this.countdownInterval = setInterval(() => {
      this.state.countdown--

      if (this.state.countdown <= 0) {
        this.startGame()
      }
    }, 1000)
  }

  private cancelCountdown() {
    this.state.gameStarting = false
    this.state.countdown = 0

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
      this.countdownInterval = null
    }
  }

  private startGame() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
      this.countdownInterval = null
    }

    // Get player data for game room
    const playerData: { id: string; name: string }[] = []
    this.state.players.forEach((player) => {
      playerData.push({ id: player.id, name: player.name })
    })

    this.broadcast('gameStart', { players: playerData })

    // Disconnect all clients (they should join game room)
    this.disconnect()
  }

  onDispose() {
    console.log('LobbyRoom disposed')
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  }
}
