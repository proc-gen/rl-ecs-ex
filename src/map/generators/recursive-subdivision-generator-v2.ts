import { addComponents, addEntity, type World } from 'bitecs'
import {
  clearMap,
  getEnemyWeights,
  getItemWeights,
  placeDoors,
  prettify,
  tunnel,
  type Generator,
} from './generator'
import type { Map } from '../map'
import type { Vector2, WeightMap } from '../../types'
import { distance, equal } from '../../utils/vector-2-funcs'
import {
  FLOOR_TILE,
  LightTypes,
  STAIRS_DOWN_TILE,
  type LightType,
} from '../../constants'
import { getRandomNumber, shuffle } from '../../utils/random'
import { Color, RNG } from 'rot-js'
import { createEnemy, createItem, createLight } from '../../ecs/templates'
import { Room, Sector } from '../containers'
import {
  PositionComponent,
  DoorComponent,
  BlockerComponent,
} from '../../ecs/components'

export class RecursiveSubdivisionGeneratorV2 implements Generator {
  world: World
  map: Map

  maxMonsters: number
  maxItems: number
  mazeSize: Vector2

  rooms: Room[]
  tunnels: Sector[]
  doors: Vector2[]

  maxRooms: number
  minRoomWidth: number
  maxRoomWidth: number
  minRoomHeight: number
  maxRoomHeight: number
  chanceForRoom: number

  constructor(
    world: World,
    map: Map,
    maxMonsters: number,
    maxItems: number,
    mazeSize: Vector2,
    maxRooms: number,
    minRoomWidth: number,
    maxRoomWidth: number,
    minRoomHeight: number,
    maxRoomHeight: number,
    chanceForRoom: number,
  ) {
    this.world = world
    this.map = map
    this.maxMonsters = maxMonsters
    this.maxItems = maxItems
    this.mazeSize = mazeSize

    this.rooms = []
    this.tunnels = []
    this.doors = []
    this.maxRooms = maxRooms
    this.minRoomWidth = minRoomWidth
    this.maxRoomWidth = maxRoomWidth
    this.minRoomHeight = minRoomHeight
    this.maxRoomHeight = maxRoomHeight
    this.chanceForRoom = chanceForRoom
  }

  generate(): void {
    clearMap(this.map)
    this.tunnels.length = 0
    this.rooms.length = 0
    this.divide(
      new Room(0, 0, this.mazeSize.x, this.mazeSize.y),
      0, 0, this.mazeSize.x, this.mazeSize.y
    )

    this.connectRooms()
    this.copyRoomsToMap()
    this.copyTunnelsToMap()

    this.placeStairs()
    prettify(this.map)
    this.doors = placeDoors(this.map)
  }

  connectRooms() {
    const connectedRooms: { a: Vector2; b: Vector2 }[] = []
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const connectingRoom: { a: Vector2; b: Vector2 } = {
        a: this.rooms[i].center(),
        b: { x: 0, y: 0 },
      }
      const connectingRooms = shuffle(this.rooms
        .filter((a) => !equal(a.center(), this.rooms[i].center()))
        .sort(
          (a, b) =>
            distance(a.center(), this.rooms[i].center()) -
            distance(b.center(), this.rooms[i].center()),
        ))

      let nextIndex = 0
      let added = false
      do {
        if (
          connectedRooms.length === 0 ||
          connectedRooms.find(
            (a) =>
              (equal(a.a, this.rooms[i].center()) &&
                equal(a.b, connectingRooms[nextIndex].center())) ||
              (equal(a.b, this.rooms[i].center()) &&
                equal(a.a, connectingRooms[nextIndex].center())),
          ) === undefined
        ) {
          connectingRoom.b = connectingRooms[nextIndex].center()
          connectedRooms.push(connectingRoom)
          added = true
        }
        nextIndex++
      } while (nextIndex < connectingRooms.length && !added)
    }

    connectedRooms.forEach((a) => {
      this.tunnels.push(tunnel(a.a, a.b))
    })
  }

  divide(
    room: Room,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
     if (height > 1 && width > 1) {
      let divideContinue: boolean = true
      if (
        this.chanceForRoom > 0 &&
        (this.maxRooms === -1 || this.rooms.length < this.maxRooms) &&
        width >= this.minRoomWidth &&
        width <= this.maxRoomWidth &&
        height >= this.minRoomHeight &&
        height <= this.maxRoomHeight
      ) {
        divideContinue = getRandomNumber(0, 100) >= this.chanceForRoom
      }

      if (divideContinue) {
        if (height > width) {
          this.divideHorizontal(room, x, y, width, height)
        } else {
          this.divideVertical(room, x, y, width, height)
        }
      } else {
        if (height > 1 && width > 1) {
          this.rooms.push(room)
        }
      }
    }
  }

  divideHorizontal(
    room: Room,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    let divideSouthOf: number = getRandomNumber(0, height - 1)

    const top = new Room(x, y, width, divideSouthOf)
    const bottom = new Room(
      x,
      y + divideSouthOf + 1,
      width,
      height - divideSouthOf - 1,
    )

    this.divide(top, x, y, width, divideSouthOf)
    this.divide(
      bottom,
      x,
      y + divideSouthOf + 1,
      width,
      height - divideSouthOf - 1,
    )
  }

  divideVertical(
    room: Room,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    let divideEastOf: number = getRandomNumber(0, width - 1)

    const left = new Room(x, y, divideEastOf, height)
    const right = new Room(
      x + divideEastOf + 1,
      y,
      width - divideEastOf - 1,
      height,
    )

    this.divide(left, x, y, divideEastOf, height)
    this.divide(
      right,
      x + divideEastOf + 1,
      y,
      width - divideEastOf - 1,
      height,
    )
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

  placeEntities() {
    let monstersLeft = this.maxMonsters
    let itemsLeft = this.maxItems
    const playerStart = this.playerStartPosition()
    const enemyWeights = getEnemyWeights(this.map)
    const itemWeights = getItemWeights(this.map)

    this.rooms.forEach((a) => {
      //this.placeLightForRoom(a)
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

    this.placeDoorEntities()
  }

  placeDoorEntities() {
    this.doors.forEach((a) => {
      const door = addEntity(this.world)
      addComponents(
        this.world,
        door,
        PositionComponent,
        DoorComponent,
        BlockerComponent,
      )
      PositionComponent.values[door] = { ...a }
      DoorComponent.values[door] = { open: false }
      this.map.addEntityAtLocation(door, PositionComponent.values[door])
    })
  }

  placeLightForRoom(a: Room) {
    const positions: Vector2[] = []
    while (positions.length < 2) {
      const position = {
        x: getRandomNumber(a.x + 1, a.x + a.width - 2),
        y: getRandomNumber(a.y + 1, a.y + a.height - 2),
      }

      if (
        positions.length === 0 ||
        positions.find((p) => equal(position, p)) === undefined
      ) {
        positions.push(position)
      }
    }

    positions.forEach((p) => {
      const color = Color.toHex([
        getRandomNumber(0, 255),
        getRandomNumber(0, 255),
        getRandomNumber(0, 255),
      ])

      const intensity = getRandomNumber(1, 3)
      const lightType =
        getRandomNumber(0, 100) > 50 ? LightTypes.Point : LightTypes.Spot
      const target = lightType === LightTypes.Spot ? a.center() : undefined
      createLight(
        this.world,
        p,
        lightType as LightType,
        color,
        intensity,
        target,
      )
    })
  }

  placeEnemiesForRoom(
    a: Room,
    monstersLeft: number,
    playerStart: Vector2,
    weights: WeightMap,
  ) {
    const maxMonstersLeft = Math.min(
      monstersLeft,
      Math.floor(this.maxMonsters / 2),
    )
    let numEnemies = Math.min(getRandomNumber(0, 2), maxMonstersLeft)

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
    const maxItemsLeft = Math.min(itemsLeft, Math.floor(this.maxItems / 2))

    let numItems = Math.min(getRandomNumber(0, 2), maxItemsLeft)

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

  playerStartPosition(): Vector2 {
    const firstRoom = this.rooms[0]
    return firstRoom.center()
  }

  placeStairs() {
    const stairs = this.stairsLocation()
    this.map.tiles[stairs.x][stairs.y] = { ...STAIRS_DOWN_TILE }
  }

  stairsLocation(): Vector2 {
    const lastRoom = this.rooms[1]
    return lastRoom.center()
  }

  isValid(): boolean {
    return true
  }
}
