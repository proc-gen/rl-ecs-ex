import { hasComponent, query, type World } from 'bitecs'
import { type RenderSystem } from './'
import {
  DeadComponent,
  PositionComponent,
  RenderableComponent,
  RenderOrder,
} from '../../components'
import { Display } from 'rot-js'
import type { Vector2 } from '../../../types'

export class RenderEntitySystem implements RenderSystem {
  world: World
  playerFOV: Vector2[]

  constructor(world: World, playerFOV: Vector2[]) {
    this.world = world
    this.playerFOV = playerFOV
  }

  render(display: Display) {
    RenderOrder.forEach((layerComponent) => {
      for (const eid of query(this.world, [
        PositionComponent,
        RenderableComponent,
        layerComponent,
      ])) {
        const position = PositionComponent.position[eid]
        const renderable = RenderableComponent.renderable[eid]

        if (
          !hasComponent(this.world, eid, DeadComponent) &&
          this.playerFOV.find(
            (a) => a.x === position.x && a.y === position.y,
          ) !== undefined
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
    })
  }
}
