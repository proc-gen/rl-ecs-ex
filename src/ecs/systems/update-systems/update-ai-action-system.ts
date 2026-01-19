import { hasComponent, type EntityId, type World } from 'bitecs'
import type { UpdateSystem } from './update-system'
import {
  ActionComponent,
  PlayerComponent,
  PositionComponent,
} from '../../components'
import { Map } from '../../../map'
import type { Vector2 } from '../../../types'

export class UpdateAiActionSystem implements UpdateSystem {
  map: Map
  player: EntityId
  playerFOV: Vector2[]

  constructor(map: Map, player: EntityId, playerFOV: Vector2[]) {
    this.map = map
    this.player = player
    this.playerFOV = playerFOV
  }

  update(world: World, entity: EntityId) {
    if (
      hasComponent(world, entity, ActionComponent) &&
      !hasComponent(world, entity, PlayerComponent)
    ) {
      const aiPosition = PositionComponent.position[entity]
      if (
        this.playerFOV.find(
          (a) => a.x === aiPosition.x && a.y === aiPosition.y,
        ) !== undefined
      ) {
        const playerPosition = PositionComponent.position[this.player]
        const path = this.map.getPath(aiPosition, playerPosition)

        if (path.length > 0) {
          const aiAction = ActionComponent.action[entity]
          aiAction.processed = false
          aiAction.xOffset = path[0].x - aiPosition.x
          aiAction.yOffset = path[0].y - aiPosition.y
        }
      }
    }
  }
}
