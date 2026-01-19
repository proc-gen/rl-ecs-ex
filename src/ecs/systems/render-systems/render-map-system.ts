import { type World } from 'bitecs'
import { type RenderSystem } from './'
import { Color, Display } from 'rot-js'
import { Map } from '../../../map'
import type { Vector2 } from '../../../types'
import { HexColors } from '../../../constants/colors'

export class RenderMapSystem implements RenderSystem {
  map: Map
  playerFOV: Vector2[]

  constructor(map: Map, playerFOV: Vector2[]) {
    this.map = map
    this.playerFOV = playerFOV
  }

  render(display: Display, _world: World) {
    for (let x = 0; x < this.map.tiles.length; x++) {
      const col = this.map.tiles[x]
      for (let y = 0; y < col.length; y++) {
        const tile = col[y]

        if (this.playerFOV.find((a) => a.x === x && a.y === y) !== undefined) {
          display.draw(x, y, tile.char, tile.fg, tile.bg)
        } else if (tile.seen) {
          const fg = Color.multiply(Color.fromString(tile.fg), HexColors.Ambient)
          const bg = Color.multiply(Color.fromString(tile.bg), HexColors.Ambient)
          display.draw(x, y, tile.char, Color.toHex(fg), Color.toHex(bg))
        }
      }
    }
  }
}
