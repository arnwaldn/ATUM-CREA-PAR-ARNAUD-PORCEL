import { Schema, MapSchema, type } from '@colyseus/schema'

export class Player extends Schema {
  @type('string') id: string = ''
  @type('string') name: string = ''
  @type('string') color: string = '#ffffff'
  @type('number') x: number = 0
  @type('number') y: number = 0
  @type('number') velocityX: number = 0
  @type('number') velocityY: number = 0
  @type('number') rotation: number = 0
  @type('number') health: number = 100
  @type('number') score: number = 0
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>()
  @type('number') gameTime: number = 0
  @type('boolean') isPlaying: boolean = false
}
