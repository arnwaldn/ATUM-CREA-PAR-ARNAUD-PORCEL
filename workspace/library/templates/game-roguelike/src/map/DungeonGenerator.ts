import { Map as RotMap } from 'rot-js'
import type { FOV } from '../utils/FOV'

interface Room {
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export class DungeonGenerator {
  private width: number
  private height: number
  private map: number[][] = []
  private rooms: Room[] = []
  private explored: boolean[][] = []
  private stairsPos: { x: number; y: number } | null = null

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.initMap()
  }

  private initMap(): void {
    this.map = []
    this.explored = []
    for (let y = 0; y < this.height; y++) {
      this.map[y] = []
      this.explored[y] = []
      for (let x = 0; x < this.width; x++) {
        this.map[y][x] = 0 // Wall
        this.explored[y][x] = false
      }
    }
  }

  generate(): void {
    this.initMap()
    this.rooms = []

    // Use ROT.js Digger for BSP dungeon generation
    const digger = new RotMap.Digger(this.width, this.height, {
      roomWidth: [4, 10],
      roomHeight: [4, 8],
      corridorLength: [2, 6],
      dugPercentage: 0.3
    })

    digger.create((x, y, value) => {
      this.map[y][x] = value === 0 ? 1 : 0 // 1 = floor, 0 = wall
    })

    // Get rooms from digger
    const rotRooms = digger.getRooms()
    rotRooms.forEach(room => {
      this.rooms.push({
        x: room.getLeft(),
        y: room.getTop(),
        width: room.getRight() - room.getLeft() + 1,
        height: room.getBottom() - room.getTop() + 1,
        centerX: Math.floor((room.getLeft() + room.getRight()) / 2),
        centerY: Math.floor((room.getTop() + room.getBottom()) / 2)
      })
    })

    // Place stairs in last room
    if (this.rooms.length > 0) {
      const lastRoom = this.rooms[this.rooms.length - 1]
      this.stairsPos = { x: lastRoom.centerX, y: lastRoom.centerY }
      this.map[this.stairsPos.y][this.stairsPos.x] = 2 // Stairs
    }
  }

  getMap(): number[][] {
    return this.map
  }

  getRooms(): Room[] {
    return this.rooms
  }

  getStartPosition(): { x: number; y: number } {
    if (this.rooms.length > 0) {
      return { x: this.rooms[0].centerX, y: this.rooms[0].centerY }
    }
    return { x: 1, y: 1 }
  }

  isWalkable(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false
    return this.map[y][x] !== 0
  }

  isTransparent(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false
    return this.map[y][x] !== 0
  }

  isStairs(x: number, y: number): boolean {
    return this.stairsPos !== null &&
           this.stairsPos.x === x &&
           this.stairsPos.y === y
  }

  isExplored(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false
    return this.explored[y][x]
  }

  updateExplored(fov: FOV): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (fov.isVisible(x, y)) {
          this.explored[y][x] = true
        }
      }
    }
  }

  getWidth(): number {
    return this.width
  }

  getHeight(): number {
    return this.height
  }
}
