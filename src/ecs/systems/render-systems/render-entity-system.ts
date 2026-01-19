import { hasComponent, query, type World } from 'bitecs'
import { type RenderSystem } from './'
import {
  DeadComponent,
  PositionComponent,
  RenderableComponent,
} from '../../components'
import { Display } from 'rot-js'
import type { Vector2 } from '../../../types'

export class RenderEntitySystem implements RenderSystem {
  playerFOV: Vector2[]

  constructor(playerFOV: Vector2[]) {
    this.playerFOV = playerFOV
  }

  render(display: Display, world: World) {
    for (const eid of query(world, [PositionComponent, RenderableComponent])) {
      const position = PositionComponent.position[eid]
      const renderable = RenderableComponent.renderable[eid]

      if (
        !hasComponent(world, eid, DeadComponent) &&
        this.playerFOV.find((a) => a.x === position.x && a.y === position.y) !==
          undefined
      ) {
        display.draw(
          position.x,
          position.y,
          renderable.char,
          renderable.fg,
          renderable.bg,
        )
      }
    }
  }
}
