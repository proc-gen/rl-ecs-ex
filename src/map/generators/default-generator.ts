import type { World } from 'bitecs'

import { FLOOR_TILE } from '../../constants/tiles'
import type { Map } from '../map'
import { Room, type Sector } from '../containers'
import { clearMap, tunnel, type Generator } from './generator'
import type { Vector2 } from '../../types'
import { getRandomNumber } from '../../utils/random'
import { createEnemy } from '../../ecs/templates'

export class DefaultGenerator implements Generator {
  world: World
  map: Map
  rooms: Room[]
  tunnels: Sector[]

  minRoomSize: number
  maxRoomSize: number
  maxRooms: number
  maxMonsters: number

  constructor(
    world: World,
    map: Map,
    maxRooms: number,
    minRoomSize: number,
    maxRoomSize: number,
    maxMonsters: number,
  ) {
    this.world = world
    this.map = map
    this.rooms = []
    this.tunnels = []

    this.maxRooms = maxRooms
    this.minRoomSize = minRoomSize
    this.maxRoomSize = maxRoomSize
    this.maxMonsters = maxMonsters
  }

  generate(): void {
    clearMap(this.map)

    this.createRooms()
    this.connectRooms()

    this.placeEnemies()

    this.copyRoomsToMap()
    this.copyTunnelsToMap()
  }

  createRooms() {
    for (let i = 0; i < this.maxRooms; i++) {
      const width = getRandomNumber(this.minRoomSize, this.maxRoomSize)
      const height = getRandomNumber(this.minRoomSize, this.maxRoomSize)

      const x = getRandomNumber(0, this.map.width - width - 1)
      const y = getRandomNumber(0, this.map.height - height - 1)

      this.addRoom(x, y, width, height)
    }
  }

  connectRooms() {
    for (let i = 0; i < this.rooms.length - 1; i++) {
      this.tunnels.push(
        tunnel(this.rooms[i].center(), this.rooms[i + 1].center()),
      )
    }
  }

  addRoom(x: number, y: number, width: number, height: number) {
    const newRoom = new Room(x, y, width, height)

    if (this.rooms.length === 0) {
      this.rooms.push(newRoom)
      return true
    } else {
      let roomPossible = true
      let i = 0

      while (i < this.rooms.length && roomPossible) {
        roomPossible = !this.rooms[i].intersects(newRoom)
        i++
      }

      if (roomPossible) {
        this.rooms.push(newRoom)
        return true
      }
    }
  }

  placeEnemies() {
    let monstersLeft = this.maxMonsters

    this.rooms.forEach((a) => {
      let numEnemies = Math.min(getRandomNumber(0, 2), monstersLeft)

      if (numEnemies > 0) {
        const positions: Vector2[] = []
        while (positions.length < numEnemies) {
          const position = {
            x: getRandomNumber(a.x + 1, a.x + a.width - 2),
            y: getRandomNumber(a.y + 1, a.y + a.height - 2),
          }

          if (
            positions.length === 0 ||
            positions.find((p) => p.x === position.x && p.y === position.y) ===
              undefined
          ) {
            positions.push(position)
          }
        }

        positions.forEach((p) => {
          let name = 'Orc'

          if (getRandomNumber(0, 100) < 80) {
            name = 'Troll'
          }

          createEnemy(this.world, p, name)
        })
      }
    })
  }

  copyRoomsToMap() {
    this.rooms.forEach((a) => {
      a.includedTiles.forEach((t) => {
        if (
          t.x > a.x &&
          t.y > a.y &&
          t.x < a.x + a.width - 1 &&
          t.y < a.y + a.height - 1
        ) {
          this.map.tiles[t.x][t.y] = { ...FLOOR_TILE }
        }
      })
    })
  }

  copyTunnelsToMap() {
    this.tunnels.forEach((a) => {
      a.includedTiles.forEach((t) => {
        this.map.tiles[t.x][t.y] = { ...FLOOR_TILE }
      })
    })
  }

  playerStartPosition(): Vector2 {
    const firstRoom = this.rooms[0]
    return firstRoom.center()
  }
}
