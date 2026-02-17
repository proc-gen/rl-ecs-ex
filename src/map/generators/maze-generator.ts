import EllerMaze from 'rot-js/lib/map/ellermaze'
import type { World } from 'bitecs'
import {
  clearMap,
  getEnemyWeights,
  getItemWeights,
  prettify,
  type Generator,
} from './generator'
import type { Map } from '../map'
import type { Vector2 } from '../../types'
import { equal, ZeroVector } from '../../utils/vector-2-funcs'
import { FLOOR_TILE, STAIRS_DOWN_TILE, WALL_TILE } from '../../constants'
import { getRandomNumber } from '../../utils/random'

export class MazeGenerator implements Generator {
  world: World
  map: Map

  maxMonsters: number
  maxItems: number

  start: Vector2
  exit: Vector2
  traversiblePositions: Vector2[]

  constructor(world: World, map: Map, maxMonsters: number, maxItems: number) {
    this.world = world
    this.map = map
    this.maxMonsters = maxMonsters
    this.maxItems = maxItems

    this.start = { ...ZeroVector }
    this.exit = { ...ZeroVector }
    this.traversiblePositions = []
  }

  generate(): void {
    clearMap(this.map)

    const ellerGenerator = new EllerMaze(
      this.map.width / 2.0,
      this.map.height / 2.0,
    )
    ellerGenerator.create((x, y, contents) => {
      if (contents === 0) {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            this.map.tiles[x * 2 + i][y * 2 + j] = { ...FLOOR_TILE }
            this.traversiblePositions.push({ x: x * 2 + i, y: y * 2 + j })
          }
        }
      }
    })

    do {
      const s =
        this.traversiblePositions[
          getRandomNumber(0, this.traversiblePositions.length)
        ]
      const e =
        this.traversiblePositions[
          getRandomNumber(0, this.traversiblePositions.length)
        ]

      const path = this.map.getPath(s, e)
      if (path.length > 25) {
        this.start = s
        this.exit = e
      }
    } while (equal(this.start, ZeroVector) || equal(this.exit, ZeroVector))

    this.placeStairs()
    prettify(this.map)
  }

  placeEntities(): void {
    let monstersLeft = this.maxMonsters
    let itemsLeft = this.maxItems
    const playerStart = this.playerStartPosition()
    const enemyWeights = getEnemyWeights(this.map)
    const itemWeights = getItemWeights(this.map)
  }
  playerStartPosition(): Vector2 {
    return this.start
  }

  placeStairs() {
    const stairs = this.stairsLocation()
    this.map.tiles[stairs.x][stairs.y] = { ...STAIRS_DOWN_TILE }
  }

  stairsLocation(): Vector2 {
    return this.exit
  }
  isValid(): boolean {
    return true
  }
}
