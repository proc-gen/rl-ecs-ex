import type { World } from 'bitecs'
import {
  clearMap,
  getEnemyWeights,
  getItemWeights,
  prettify,
  type Generator,
} from './generator'
import type { Map } from '../map'
import type { Vector2, WeightMap } from '../../types'
import { equal, ZeroVector } from '../../utils/vector-2-funcs'
import {
  FLOOR_TILE,
  LightTypes,
  STAIRS_DOWN_TILE,
  WALL_TILE,
  type LightType,
} from '../../constants'
import { getRandomNumber } from '../../utils/random'
import { Color, RNG } from 'rot-js'
import { createEnemy, createItem, createLight } from '../../ecs/templates'
import { Cell, Grid } from '../containers'
import { CellFuncs } from '../../utils/cell-funcs'

export class RecursiveSubdivisionGenerator implements Generator {
  world: World
  map: Map

  maxMonsters: number
  maxItems: number
  mazeSize: Vector2

  start: Vector2
  exit: Vector2
  traversiblePositions: Vector2[]

  grid: Grid
  numRooms: number

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

    this.grid = new Grid(
      Math.floor(Math.max(map.width / 3, mazeSize.x / 3)),
      Math.floor(Math.max(map.height / 3, mazeSize.y / 3)),
    )
    this.numRooms = 0

    this.maxRooms = maxRooms
    this.minRoomWidth = minRoomWidth
    this.maxRoomWidth = maxRoomWidth
    this.minRoomHeight = minRoomHeight
    this.maxRoomHeight = maxRoomHeight
    this.chanceForRoom = chanceForRoom

    this.start = { ...ZeroVector }
    this.exit = { ...ZeroVector }
    this.traversiblePositions = []
  }

  generate(): void {
    clearMap(this.map)
    this.generateGrid()
    this.copyGridToMap()

    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        if (this.map.isWalkable(x, y)) {
          this.traversiblePositions.push({ x, y })
        }
      }
    }

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

  generateGrid() {
    const mapCells: Cell[] = []
    this.numRooms = 0
    let startX: number, startY: number, startWidth: number, startHeight: number

    for (let i: number = 0; i < this.grid.width; i++) {
      for (let j: number = 0; j < this.grid.height; j++) {
        mapCells.push(this.grid.cells[i][j])
        for (let k: number = 0; k < 4; k++) {
          if (this.grid.cells[i][j].adjacentCells[k] !== undefined) {
            this.grid.cells[i][j].setWall(k, false)
          }
        }
      }
    }

    startX = CellFuncs.MinX(mapCells)
    startY = CellFuncs.MinY(mapCells)
    startWidth = CellFuncs.MaxX(mapCells) - startX + 1
    startHeight = CellFuncs.MaxY(mapCells) - startY + 1

    this.divide(mapCells, startX, startY, startHeight, startWidth)
  }

  copyGridToMap() {
    for (let i = 0; i < this.grid.width; i++) {
      for (let j = 0; j < this.grid.height; j++) {
        const cell = this.grid.cells[i][j]
        this.map.tiles[i * 3][j * 3] =
          cell.walls[0].isWall || cell.walls[3].isWall
            ? { ...WALL_TILE }
            : { ...FLOOR_TILE }
        this.map.tiles[i * 3 + 1][j * 3] = cell.walls[0].isWall
          ? { ...WALL_TILE }
          : { ...FLOOR_TILE }
        this.map.tiles[i * 3 + 2][j * 3] =
          cell.walls[0].isWall || cell.walls[1].isWall
            ? { ...WALL_TILE }
            : { ...FLOOR_TILE }
        this.map.tiles[i * 3][j * 3 + 1] = cell.walls[3].isWall
          ? { ...WALL_TILE }
          : { ...FLOOR_TILE }
        this.map.tiles[i * 3 + 1][j * 3 + 1] =
          cell.walls[0].isWall &&
          cell.walls[1].isWall &&
          cell.walls[2].isWall &&
          cell.walls[3].isWall
            ? { ...WALL_TILE }
            : { ...FLOOR_TILE }
        this.map.tiles[i * 3 + 2][j * 3 + 1] = cell.walls[1].isWall
          ? { ...WALL_TILE }
          : { ...FLOOR_TILE }
        this.map.tiles[i * 3][j * 3 + 2] =
          cell.walls[2].isWall || cell.walls[3].isWall
            ? { ...WALL_TILE }
            : { ...FLOOR_TILE }
        this.map.tiles[i * 3 + 1][j * 3 + 2] = cell.walls[2].isWall
          ? { ...WALL_TILE }
          : { ...FLOOR_TILE }
        this.map.tiles[i * 3 + 2][j * 3 + 2] =
          cell.walls[1].isWall || cell.walls[2].isWall
            ? { ...WALL_TILE }
            : { ...FLOOR_TILE }
      }
    }
  }

  divide(
    mapCells: Cell[],
    row: number,
    column: number,
    height: number,
    width: number,
  ): void {
    if (height > 1 || width > 1) {
      let divideContinue: boolean =
        width >= this.minRoomWidth && height >= this.minRoomHeight
      if (
        this.chanceForRoom > 0 &&
        (this.maxRooms === -1 || this.numRooms < this.maxRooms) &&
        width >= this.minRoomWidth &&
        width <= this.maxRoomWidth &&
        height >= this.minRoomHeight &&
        height <= this.maxRoomHeight
      ) {
        divideContinue = getRandomNumber(0, 100) >= this.chanceForRoom
      }

      if (divideContinue) {
        if (height > width) {
          this.divideHorizontal(mapCells, row, column, height, width)
        } else {
          this.divideVertical(mapCells, row, column, height, width)
        }
      } else {
        if (height > 1 && width > 1) {
          this.numRooms++
        }
      }
    }
  }

  divideHorizontal(
    mapCells: Cell[],
    row: number,
    column: number,
    height: number,
    width: number,
  ): void {
    let divideSouthOf: number = getRandomNumber(0, height - 1)

    let affectedCells: Cell[] = mapCells
      .filter(
        (a) =>
          a.y === row + divideSouthOf && a.x >= column && a.x < column + width,
      )
      .sort((a, b) => this.compareElement(a, b, 'x'))

    if (
      affectedCells.length > 0 &&
      affectedCells.some((a) => a.adjacentCells[0] !== undefined)
    ) {
      affectedCells.forEach((a) => {
        if (a.adjacentCells[0] !== undefined) {
          a.setWall(0, true)
          a.adjacentCells[0].setWall(2, true)
        }
      })

      if (row + divideSouthOf < CellFuncs.MaxY(mapCells)) {
        let passageCell: number = -1
        let affectedCellSection: Cell[] = []
        for (let i: number = 0; i < affectedCells.length; i++) {
          if (
            affectedCellSection.length === 0 ||
            CellFuncs.MaxX(affectedCellSection) - affectedCells[i].x === -1
          ) {
            affectedCellSection.push(affectedCells[i])
          } else {
            if (
              affectedCellSection.some((a) => a.adjacentCells[0] !== undefined)
            ) {
              do {
                passageCell = getRandomNumber(0, affectedCellSection.length - 1)
              } while (
                affectedCellSection[passageCell].adjacentCells[0] === undefined
              )
              this.mergeCells(
                affectedCellSection[passageCell],
                affectedCellSection[passageCell].adjacentCells[0],
              )
              affectedCellSection = []
            }
          }
        }

        if (affectedCellSection.some((a) => a.adjacentCells[0] !== undefined)) {
          do {
            passageCell = getRandomNumber(0, affectedCellSection.length - 1)
          } while (
            affectedCellSection[passageCell].adjacentCells[0] === undefined
          )
          this.mergeCells(
            affectedCellSection[passageCell],
            affectedCellSection[passageCell].adjacentCells[0],
          )
        }
      }

      this.divide(mapCells, row, column, divideSouthOf + 1, width)
      this.divide(
        mapCells,
        row + divideSouthOf + 1,
        column,
        height - divideSouthOf - 1,
        width,
      )
    }
  }

  divideVertical(
    mapCells: Cell[],
    row: number,
    column: number,
    height: number,
    width: number,
  ): void {
    let divideEastOf: number = getRandomNumber(0, width - 1)

    let affectedCells: Cell[] = mapCells
      .filter(
        (a) =>
          a.x === column + divideEastOf && a.y >= row && a.y < row + height,
      )
      .sort((a, b) => this.compareElement(a, b, 'y'))

    if (
      affectedCells.length > 0 &&
      affectedCells.some((a) => a.adjacentCells[1] !== undefined)
    ) {
      affectedCells.forEach((a) => {
        if (a.adjacentCells[1] !== undefined) {
          a.setWall(1, true)
          a.adjacentCells[1].setWall(3, true)
        }
      })

      if (column + divideEastOf < CellFuncs.MaxX(mapCells)) {
        let passageCell: number = -1
        let affectedCellSection: Cell[] = []
        for (let i: number = 0; i < affectedCells.length; i++) {
          if (
            affectedCellSection.length === 0 ||
            CellFuncs.MaxY(affectedCellSection) - affectedCells[i].y === -1
          ) {
            affectedCellSection.push(affectedCells[i])
          } else {
            if (
              affectedCellSection.some((a) => a.adjacentCells[1] !== undefined)
            ) {
              do {
                passageCell = getRandomNumber(0, affectedCellSection.length - 1)
              } while (
                affectedCellSection[passageCell].adjacentCells[1] === undefined
              )
              this.mergeCells(
                affectedCellSection[passageCell],
                affectedCellSection[passageCell].adjacentCells[1],
              )
              affectedCellSection = []
            }
          }
        }

        if (affectedCellSection.some((a) => a.adjacentCells[1] !== undefined)) {
          do {
            passageCell = getRandomNumber(0, affectedCellSection.length - 1)
          } while (
            affectedCellSection[passageCell].adjacentCells[1] === undefined
          )
          this.mergeCells(
            affectedCellSection[passageCell],
            affectedCellSection[passageCell].adjacentCells[1],
          )
        }
      }

      this.divide(mapCells, row, column, height, divideEastOf + 1)
      this.divide(
        mapCells,
        row,
        column + divideEastOf + 1,
        height,
        width - divideEastOf - 1,
      )
    }
  }

  mergeCells(currentCell: Cell, nextCell: Cell | undefined): void {
    if (
      currentCell.adjacentCells[0] !== undefined &&
      currentCell.adjacentCells[0]?.x === nextCell?.x &&
      currentCell.adjacentCells[0]?.y === nextCell?.y
    ) {
      currentCell.setWall(0, false)
      nextCell.setWall(2, false)
    } else if (
      currentCell.adjacentCells[1] !== undefined &&
      currentCell.adjacentCells[1]?.x === nextCell?.x &&
      currentCell.adjacentCells[1]?.y === nextCell?.y
    ) {
      currentCell.setWall(1, false)
      nextCell.setWall(3, false)
    } else if (
      currentCell.adjacentCells[2] !== undefined &&
      currentCell.adjacentCells[2]?.x === nextCell?.x &&
      currentCell.adjacentCells[2]?.y === nextCell?.y
    ) {
      currentCell.setWall(2, false)
      nextCell.setWall(0, false)
    } else if (
      currentCell.adjacentCells[3] !== undefined &&
      currentCell.adjacentCells[3]?.x === nextCell?.x &&
      currentCell.adjacentCells[3]?.y === nextCell?.y
    ) {
      currentCell.setWall(3, false)
      nextCell.setWall(1, false)
    }
  }

  compareElement<Type, Key extends keyof Type>(
    a: Type,
    b: Type,
    key: Key,
  ): number {
    return a[key] === b[key] ? 0 : a[key] < b[key] ? -1 : 1
  }

  placeEntities(): void {
    const playerStart = this.playerStartPosition()
    const enemyWeights = getEnemyWeights(this.map)
    const itemWeights = getItemWeights(this.map)

    this.placeEnemies(playerStart, enemyWeights)
    this.placeItems(playerStart, itemWeights)
    this.placeLights()
  }

  placeEnemies(playerStart: Vector2, weights: WeightMap) {
    const positions: Vector2[] = []
    while (positions.length < this.maxMonsters) {
      const position =
        this.traversiblePositions[
          getRandomNumber(0, this.traversiblePositions.length)
        ]

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

  placeItems(playerStart: Vector2, weights: WeightMap) {
    const positions: Vector2[] = []
    while (positions.length < this.maxItems) {
      const position =
        this.traversiblePositions[
          getRandomNumber(0, this.traversiblePositions.length)
        ]

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

  placeLights() {
    const positions: Vector2[] = []
    this.traversiblePositions.forEach((p) => {
      const adjacentTiles = [
        this.map.tiles[p.x][p.y + 1],
        this.map.tiles[p.x + 1][p.y],
        this.map.tiles[p.x][p.y - 1],
        this.map.tiles[p.x - 1][p.y],
      ]

      if (
        adjacentTiles.filter((t) => t !== undefined && t.name === 'Wall')
          .length === 2
      ) {
        positions.push(p)
      }
    })

    positions.forEach((p) => {
      const color = Color.toHex([
        getRandomNumber(0, 255),
        getRandomNumber(0, 255),
        getRandomNumber(0, 255),
      ])

      const intensity = getRandomNumber(1, 3)
      createLight(
        this.world,
        p,
        LightTypes.Point as LightType,
        color,
        intensity,
        undefined,
      )
    })
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
