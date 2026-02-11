import { type EntityId, type World } from 'bitecs'
import { type RenderSystem } from './'
import { Display } from 'rot-js'
import { Map } from '../../../map'
import type { Vector2 } from '../../../types'
import { Colors } from '../../../constants/colors'
import { ConstMultiplyColor, MixColors } from '../../../utils/color-funcs'
import { PositionComponent, type Position } from '../../components'
import { DisplayValues } from '../../../constants/display-values'
import type { UpdateSystem } from '../update-systems'
import { distance } from '../../../utils/vector-2-funcs'
import { processFOV } from '../../../utils/fov-funcs'

export class RenderMapSystem implements RenderSystem, UpdateSystem {
  map: Map
  player: EntityId
  playerFOV: Vector2[]
  world: World

  constructor(world: World, map: Map, player: EntityId, playerFOV: Vector2[]) {
    this.world = world
    this.map = map
    this.player = player
    this.playerFOV = playerFOV
  }

  update(world: World, _entity: EntityId): void {
    for (let x = 0; x < this.map.tiles.length; x++) {
      const col = this.map.tiles[x]
      for (let y = 0; y < col.length; y++) {
        const tile = col[y]
        tile.lighting = Colors.Ambient
      }
    }

    const playerLocation = PositionComponent.values[this.player]
    const playerLightFOV = processFOV(this.map, PositionComponent.values[this.player], 8)
    playerLightFOV.forEach(p => {
      const attenuation = this.attenuationForLocation(playerLocation, p, 3)
      this.map.tiles[p.x][p.y].lighting = ConstMultiplyColor(Colors.White, attenuation)
    })
  }

  attenuationForLocation(lightSource: Vector2, location: Vector2, intensity: number){
    const d = distance(lightSource, location)
    return Math.max(Math.min(intensity / d, 1.0), 0.0)
  }

  render(display: Display, playerPosition: Position) {
    const xOffset = DisplayValues.HalfWidth - playerPosition.x
    const yOffset = DisplayValues.HalfHeight - playerPosition.y
    for (let x = 0; x < this.map.tiles.length; x++) {
      const col = this.map.tiles[x]
      for (let y = 0; y < col.length; y++) {
        const tile = col[y]

        if (tile.seen) {
          const fg = MixColors(tile.fg, tile.lighting)
          const bg = MixColors(tile.bg, tile.lighting)
          display.draw(x + xOffset, y + yOffset, tile.char, fg, bg)
        }
      }
    }
  }
}
