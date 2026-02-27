import { Cell } from './cell'

export class Grid {
  width: number
  height: number
  cells: Cell[][]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.cells = []

    for (let i: number = 0; i < width; i++) {
      this.cells[i] = []
      for (let j: number = 0; j < height; j++) {
        this.cells[i][j] = new Cell(i, j)
      }
    }

    this.initializeGrid()
  }

  initializeGrid(): void {
    for (let i: number = 0; i < this.width; i++) {
      for (let j: number = 0; j < this.height; j++) {
        //North
        if (j < this.height - 1) {
          this.cells[i][j].adjacentCells.push(this.cells[i][j + 1])
        } else {
          this.cells[i][j].adjacentCells.push(undefined)
        }
        //East
        if (i < this.width - 1) {
          this.cells[i][j].adjacentCells.push(this.cells[i + 1][j])
        } else {
          this.cells[i][j].adjacentCells.push(undefined)
        }
        //South
        if (j > 0) {
          this.cells[i][j].adjacentCells.push(this.cells[i][j - 1])
        } else {
          this.cells[i][j].adjacentCells.push(undefined)
        }
        //West
        if (i > 0) {
          this.cells[i][j].adjacentCells.push(this.cells[i - 1][j])
        } else {
          this.cells[i][j].adjacentCells.push(undefined)
        }

        for (let w: number = 0; w < 4; w++) {
          this.cells[i][j].setWall(w, true)
        }
      }
    }
  }
}
