import { hasComponent, type EntityId, type World } from 'bitecs'
import type { UpdateSystem } from './update-system'
import {
  ActionComponent,
  ConfusionComponent,
  PlayerComponent,
  PositionComponent,
} from '../../components'
import { Map } from '../../../map'
import type { Vector2 } from '../../../types'
import { getRandomNumber } from '../../../utils/random'

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
      const aiPosition = PositionComponent.values[entity]
      if (
        this.playerFOV.find(
          (a) => a.x === aiPosition.x && a.y === aiPosition.y,
        ) !== undefined
      ) {
        const aiAction = ActionComponent.values[entity]
        aiAction.processed = false

        if (hasComponent(world, entity, ConfusionComponent)) {
          aiAction.xOffset = getRandomNumber(-1, 1)
          aiAction.yOffset = aiAction.xOffset === 0 ? getRandomNumber(-1, 1) : 0
        } else {
          const playerPosition = PositionComponent.values[this.player]
          const path = this.map.getPath(aiPosition, playerPosition)

          if (path.length > 0) {
            aiAction.xOffset = path[0].x - aiPosition.x
            aiAction.yOffset = path[0].y - aiPosition.y
          }
        }
      }
    }
  }
}
