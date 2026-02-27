import type { Cell } from '../map/containers'

export class CellFuncs {
  public static MaxX(mapCells: Cell[]): number {
    let retVal: number = -Infinity
    for (let i: number = 0; i < mapCells.length; i++) {
      retVal = mapCells[i].x > retVal ? mapCells[i].x : retVal
    }
    return retVal
  }

  public static MinX(mapCells: Cell[]): number {
    let retVal: number = Infinity
    for (let i: number = 0; i < mapCells.length; i++) {
      retVal = mapCells[i].x < retVal ? mapCells[i].x : retVal
    }
    return retVal
  }

  public static MaxY(mapCells: Cell[]): number {
    let retVal: number = -Infinity
    for (let i: number = 0; i < mapCells.length; i++) {
      retVal = mapCells[i].y > retVal ? mapCells[i].y : retVal
    }
    return retVal
  }

  public static MinY(mapCells: Cell[]): number {
    let retVal: number = Infinity
    for (let i: number = 0; i < mapCells.length; i++) {
      retVal = mapCells[i].y < retVal ? mapCells[i].y : retVal
    }
    return retVal
  }
}
