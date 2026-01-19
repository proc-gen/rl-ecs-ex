import { WALL_TILE, FLOOR_TILE } from '../../constants/tiles'
import type { Vector2 } from '../../types'
import type { Map } from '../map'
import { type Generator } from './generator'

export class TestGenerator implements Generator {
  map: Map

  constructor(map: Map) {
    this.map = map
  }

  generate(): void {
    const xMax = this.map.width - 1
    const yMax = this.map.height - 1

    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        if (
          x % xMax === 0 ||
          y % yMax === 0 ||
          (x % Math.round(xMax / 3) < 2 && y % Math.round(yMax / 3) < 2)
        ) {
          this.map.tiles[x][y] = { ...WALL_TILE }
        } else {
          this.map.tiles[x][y] = { ...FLOOR_TILE }
        }
      }
    }
  }

  playerStartPosition(): Vector2 {
    return {
      x: Math.round(this.map.width / 2),
      y: Math.round(this.map.height / 2),
    }
  }
}
