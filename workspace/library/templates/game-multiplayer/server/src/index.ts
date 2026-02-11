import { Server } from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { createServer } from 'http'
import { GameRoom } from './rooms/GameRoom.js'
import { LobbyRoom } from './rooms/LobbyRoom.js'

const port = Number(process.env.PORT) || 2567

const server = createServer()

const gameServer = new Server({
  transport: new WebSocketTransport({
    server
  })
})

// Register rooms
gameServer.define('lobby', LobbyRoom)
gameServer.define('game', GameRoom)

// Start server
server.listen(port, () => {
  console.log(`🎮 Game server running on ws://localhost:${port}`)
  console.log(`📊 Monitor: http://localhost:${port}/colyseus`)
})
