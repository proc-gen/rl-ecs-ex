import type { World } from 'bitecs'

import { FLOOR_TILE, STAIRS_DOWN_TILE } from '../../constants/tiles'
import type { Map } from '../map'
import { Room, type Sector } from '../containers'
import { clearMap, tunnel, type Generator } from './generator'
import type { Vector2, WeightMap } from '../../types'
import { getRandomNumber } from '../../utils/random'
import { createEnemy, createItem } from '../../ecs/templates'
import { equal } from '../../utils/vector-2-funcs'
import { RNG } from 'rot-js'

export class DefaultGenerator implements Generator {
  world: World
  map: Map
  rooms: Room[]
  tunnels: Sector[]

  minRoomSize: number
  maxRoomSize: number
  maxRooms: number
  maxMonsters: number
  maxItems: number

  constructor(
    world: World,
    map: Map,
    maxRooms: number,
    minRoomSize: number,
    maxRoomSize: number,
    maxMonsters: number,
    maxItems: number,
  ) {
    this.world = world
    this.map = map
    this.rooms = []
    this.tunnels = []

    this.maxRooms = maxRooms
    this.minRoomSize = minRoomSize
    this.maxRoomSize = maxRoomSize
    this.maxMonsters = maxMonsters
    this.maxItems = maxItems
  }

  generate(): void {
    clearMap(this.map)

    this.createRooms()
    this.connectRooms()

    this.placeEntities()

    this.copyRoomsToMap()
    this.copyTunnelsToMap()

    this.placeStairs()
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

  placeEntities() {
    let monstersLeft = this.maxMonsters
    let itemsLeft = this.maxItems
    const playerStart = this.playerStartPosition()
    const enemyWeights = this.getEnemyWeights()
    const itemWeights = this.getItemWeights()

    this.rooms.forEach((a) => {
      monstersLeft -= this.placeEnemiesForRoom(
        a,
        monstersLeft,
        playerStart,
        enemyWeights,
      )
      itemsLeft -= this.placeItemsForRoom(
        a,
        itemsLeft,
        playerStart,
        itemWeights,
      )
    })
  }

  getEnemyWeights(): WeightMap {
    const weights: WeightMap = { Orc: 80 }

    if (this.map.level >= 3 && this.map.level < 5) {
      weights['Troll'] = 15
    } else if (this.map.level >= 5 && this.map.level < 7) {
      weights['Troll'] = 30
    } else if (this.map.level >= 7) {
      weights['Troll'] = 60
    }

    return weights
  }

  getItemWeights(): WeightMap {
    const weights: WeightMap = {
      'Health Potion': 35,
      Dagger: 10,
      'Leather Armor': 10,
    }

    if (this.map.level >= 2) {
      weights['Confusion Scroll'] = 10
    }
    if (this.map.level >= 4) {
      weights['Lightning Scroll'] = 25
      weights['Sword'] = 5
    }
    if (this.map.level >= 6) {
      weights['Fireball Scroll'] = 25
      weights['Chain Mail'] = 15
    }

    return weights
  }

  placeEnemiesForRoom(
    a: Room,
    monstersLeft: number,
    playerStart: Vector2,
    weights: WeightMap,
  ) {
    let numEnemies = Math.min(getRandomNumber(0, 2), monstersLeft)

    if (numEnemies > 0) {
      const positions: Vector2[] = []
      while (positions.length < numEnemies) {
        const position = {
          x: getRandomNumber(a.x + 1, a.x + a.width - 2),
          y: getRandomNumber(a.y + 1, a.y + a.height - 2),
        }

        if (
          (positions.length === 0 ||
            positions.find((p) => equal(position, p)) === undefined) &&
          !equal(position, playerStart)
        ) {
          positions.push(position)
        }
      }

      positions.forEach((p) => {
        const enemy = RNG.getWeightedValue(weights)
        if (enemy !== undefined) {
          createEnemy(this.world, p, enemy)
        }
      })
    }

    return numEnemies
  }

  placeItemsForRoom(
    a: Room,
    itemsLeft: number,
    playerStart: Vector2,
    weights: WeightMap,
  ) {
    let numItems = Math.min(getRandomNumber(0, 2), itemsLeft)

    if (numItems > 0) {
      const positions: Vector2[] = []
      while (positions.length < numItems) {
        const position = {
          x: getRandomNumber(a.x + 1, a.x + a.width - 2),
          y: getRandomNumber(a.y + 1, a.y + a.height - 2),
        }

        if (
          (positions.length === 0 ||
            positions.find((p) => equal(position, p)) === undefined) &&
          !equal(position, playerStart)
        ) {
          positions.push(position)
        }
      }

      positions.forEach((p) => {
        const item = RNG.getWeightedValue(weights)
        if (item !== undefined) {
          createItem(this.world, item, p, undefined)
        }
      })
    }

    return numItems
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

  placeStairs() {
    const lastRoom = this.rooms[this.rooms.length - 1]
    const center = lastRoom.center()
    this.map.tiles[center.x][center.y] = { ...STAIRS_DOWN_TILE }
  }
}
