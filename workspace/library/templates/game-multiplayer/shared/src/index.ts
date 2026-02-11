// Shared types between client and server

export interface Vector2 {
  x: number
  y: number
}

export interface PlayerInput {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  action: boolean
  sequence: number
}

export interface PlayerState {
  id: string
  x: number
  y: number
  velocityX: number
  velocityY: number
  rotation: number
  health: number
  score: number
  name: string
  color: string
}

export interface GameConfig {
  tickRate: number
  mapWidth: number
  mapHeight: number
  playerSpeed: number
  maxPlayers: number
}

export const DEFAULT_CONFIG: GameConfig = {
  tickRate: 20,
  mapWidth: 800,
  mapHeight: 600,
  playerSpeed: 200,
  maxPlayers: 8
}

// Message types
export enum MessageType {
  PLAYER_INPUT = 'playerInput',
  PLAYER_ACTION = 'playerAction',
  CHAT_MESSAGE = 'chatMessage',
  READY = 'ready',
  GAME_START = 'gameStart',
  GAME_END = 'gameEnd'
}

export interface ChatMessage {
  playerId: string
  playerName: string
  message: string
  timestamp: number
}

// Room types
export const ROOM_TYPES = {
  LOBBY: 'lobby',
  GAME: 'game'
} as const

export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES]
