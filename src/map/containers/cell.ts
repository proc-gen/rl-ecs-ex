import type { Wall } from './wall'

const numCellSides = 4

export class Cell {
  x: number
  y: number

  visited!: boolean
  adjacentCells!: (Cell | undefined)[]
  walls!: Wall[]

  constructor(x: number, y: number) {
    this.x = x
    this.y = y

    this.visited = false

    this.adjacentCells = []
    this.walls = []

    for (let i: number = 0; i < numCellSides; i++) {
      const wall = {
        direction: i,
        isWall: false,
      }
      this.walls.push(wall)
    }
  }

  setWall(direction: number, isWall: boolean): void {
    this.walls[direction].isWall = isWall
  }
}
