import { Client, Room } from 'colyseus.js'
import type { PlayerInput, MessageType } from '@game/shared'

export class NetworkManager {
  private client: Client
  private room: Room | null = null

  private onStateChangeCallback?: (state: unknown) => void
  private onPlayerJoinCallback?: (sessionId: string) => void
  private onPlayerLeaveCallback?: (sessionId: string) => void
  private onMessageCallback?: (type: string, message: unknown) => void

  constructor(serverUrl = 'ws://localhost:2567') {
    this.client = new Client(serverUrl)
    this.updateConnectionStatus('connecting')
  }

  async joinLobby(playerName: string): Promise<Room> {
    try {
      this.room = await this.client.joinOrCreate('lobby', { name: playerName })
      this.setupRoomListeners()
      this.updateConnectionStatus('connected')
      return this.room
    } catch (error) {
      this.updateConnectionStatus('disconnected')
      throw error
    }
  }

  async joinGame(playerName: string, color?: string): Promise<Room> {
    try {
      // Leave current room if any
      if (this.room) {
        await this.room.leave()
      }

      this.room = await this.client.joinOrCreate('game', {
        name: playerName,
        color
      })
      this.setupRoomListeners()
      this.updateConnectionStatus('connected')
      return this.room
    } catch (error) {
      this.updateConnectionStatus('disconnected')
      throw error
    }
  }

  private setupRoomListeners(): void {
    if (!this.room) return

    this.room.onStateChange((state) => {
      this.onStateChangeCallback?.(state)
    })

    this.room.state.players?.onAdd((player: unknown, sessionId: string) => {
      this.onPlayerJoinCallback?.(sessionId)
    })

    this.room.state.players?.onRemove((_player: unknown, sessionId: string) => {
      this.onPlayerLeaveCallback?.(sessionId)
    })

    this.room.onLeave(() => {
      this.updateConnectionStatus('disconnected')
    })
  }

  sendInput(input: PlayerInput): void {
    this.room?.send('playerInput' as MessageType, input)
  }

  sendMessage(type: string, message: unknown): void {
    this.room?.send(type, message)
  }

  onStateChange(callback: (state: unknown) => void): void {
    this.onStateChangeCallback = callback
  }

  onPlayerJoin(callback: (sessionId: string) => void): void {
    this.onPlayerJoinCallback = callback
  }

  onPlayerLeave(callback: (sessionId: string) => void): void {
    this.onPlayerLeaveCallback = callback
  }

  onMessage(callback: (type: string, message: unknown) => void): void {
    this.onMessageCallback = callback
    this.room?.onMessage('*', (type, message) => {
      callback(type as string, message)
    })
  }

  getSessionId(): string | undefined {
    return this.room?.sessionId
  }

  getRoom(): Room | null {
    return this.room
  }

  async leave(): Promise<void> {
    if (this.room) {
      await this.room.leave()
      this.room = null
    }
  }

  private updateConnectionStatus(status: 'connecting' | 'connected' | 'disconnected'): void {
    const el = document.getElementById('connection-status')
    if (el) {
      el.className = status
      el.textContent = status === 'connected'
        ? 'Connected'
        : status === 'connecting'
          ? 'Connecting...'
          : 'Disconnected'
    }
  }
}

// Singleton instance
export const networkManager = new NetworkManager()
