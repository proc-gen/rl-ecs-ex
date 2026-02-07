import { type World } from 'bitecs'
import { type RenderSystem } from './'
import { Display } from 'rot-js'
import { Map } from '../../../map'
import type { Vector2 } from '../../../types'
import { Colors } from '../../../constants/colors'
import { MixColors } from '../../../utils/color-funcs'
import type { Position } from '../../components'
import { DisplayValues } from '../../../constants/display-values'

export class RenderMapSystem implements RenderSystem {
  map: Map
  playerFOV: Vector2[]
  world: World

  constructor(world: World, map: Map, playerFOV: Vector2[]) {
    this.world = world
    this.map = map
    this.playerFOV = playerFOV
  }

  render(display: Display, playerPosition: Position) {
    const xOffset = DisplayValues.HalfWidth - playerPosition.x
    const yOffset = DisplayValues.HalfHeight - playerPosition.y
    for (let x = 0; x < this.map.tiles.length; x++) {
      const col = this.map.tiles[x]
      for (let y = 0; y < col.length; y++) {
        const tile = col[y]

        if (this.playerFOV.find((a) => a.x === x && a.y === y) !== undefined) {
          display.draw(x + xOffset, y + yOffset, tile.char, tile.fg, tile.bg)
        } else if (tile.seen) {
          const fg = MixColors(tile.fg, Colors.Ambient)
          const bg = MixColors(tile.bg, Colors.Ambient)
          display.draw(x + xOffset, y + yOffset, tile.char, fg, bg)
        }
      }
    }
  }
}
