import { hasComponent, type EntityId, type World } from 'bitecs'
import type { UpdateSystem } from './update-system'
import {
  ActionComponent,
  ConfusionComponent,
  FieldOfViewComponent,
  PathfinderComponent,
  PlayerComponent,
  PositionComponent,
} from '../../components'
import { Map } from '../../../map'
import { getRandomNumber } from '../../../utils/random'
import { processFOV } from '../../../utils/fov-funcs'
import type { Vector2 } from '../../../types'
import { equal } from '../../../utils/vector-2-funcs'

export class UpdateAiActionSystem implements UpdateSystem {
  map: Map
  player: EntityId

  constructor(map: Map, player: EntityId) {
    this.map = map
    this.player = player
  }

  update(world: World, entity: EntityId) {
    if (
      hasComponent(world, entity, ActionComponent) &&
      !hasComponent(world, entity, PlayerComponent)
    ) {
      const aiPosition = PositionComponent.values[entity]
      const aiPathfinder = PathfinderComponent.values[entity]
      const aiFOV = FieldOfViewComponent.values[entity]
      const fov = processFOV(this.map, aiPosition, aiFOV.currentFOV)
      const aiAction = ActionComponent.values[entity]
      aiAction.processed = false
      const playerPosition = PositionComponent.values[this.player]

      if (hasComponent(world, entity, ConfusionComponent)) {
        aiAction.xOffset = getRandomNumber(-1, 1)
        aiAction.yOffset = aiAction.xOffset === 0 ? getRandomNumber(-1, 1) : 0
      } else if (this.fovContainsPlayer(fov, playerPosition)) {
        aiPathfinder.lastKnownTargetPosition = playerPosition
        const next = this.nextPosition(aiPosition, playerPosition)

        if (next !== undefined) {
          aiAction.xOffset = next.x - aiPosition.x
          aiAction.yOffset = next.y - aiPosition.y
        }
      } else if (aiPathfinder.lastKnownTargetPosition !== undefined) {
        if (aiPosition === aiPathfinder.lastKnownTargetPosition) {
          aiPathfinder.lastKnownTargetPosition = undefined
          aiAction.processed = true
        } else {
          const next = this.nextPosition(
            aiPosition,
            aiPathfinder.lastKnownTargetPosition,
          )

          if (next !== undefined) {
            aiAction.xOffset = next.x - aiPosition.x
            aiAction.yOffset = next.y - aiPosition.y
          }
        }
      } else {
        aiAction.processed = true
      }
    }
  }

  nextPosition(current: Vector2, next: Vector2) {
    const path = this.map.getPath(current, next)

    return path.length > 0 ? path[0] : undefined
  }

  fovContainsPlayer(fov: Vector2[], playerPosition: Vector2) {
    return fov.find((p) => equal(p, playerPosition)) !== undefined
  }
}
