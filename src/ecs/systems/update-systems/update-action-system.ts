import {
  addComponent,
  addEntity,
  hasComponent,
  removeComponent,
  type EntityId,
  type World,
} from 'bitecs'
import { type UpdateSystem } from './'
import {
  ActionComponent,
  type Action,
  PositionComponent,
  PlayerComponent,
  type Position,
  BlockerComponent,
  WantMeleeAttackComponent,
  InfoComponent,
  WantUseItemComponent,
  ItemComponent,
  OwnerComponent,
} from '../../components'
import { Map } from '../../../map'
import type { Vector2 } from '../../../types'
import { FOV } from 'rot-js'
import type { MessageLog } from '../../../utils/message-log'
import { ItemActionType } from '../../../constants/item-action-type'

export class UpdateActionSystem implements UpdateSystem {
  map: Map
  playerFOV: Vector2[]
  log: MessageLog

  constructor(
    log: MessageLog,
    map: Map,
    playerPosition: Position,
    playerFOV: Vector2[],
  ) {
    this.log = log
    this.map = map
    this.playerFOV = playerFOV
    this.processPlayerFOV(playerPosition)
  }

  update(world: World, entity: EntityId) {
    const position = PositionComponent.position[entity]
    const action = ActionComponent.action[entity]

    if (!action.processed) {
      const newPosition = {
        x: position.x + action.xOffset,
        y: position.y + action.yOffset,
      }

      if (action.useItem !== undefined) {
        if (action.itemActionType === ItemActionType.Use) {
          const item = addEntity(world)
          addComponent(world, item, WantUseItemComponent)
          WantUseItemComponent.wantUseItem[item] = {
            owner: entity,
            item: action.useItem,
          }
          this.resetAction(action, true)
        } else if (action.itemActionType === ItemActionType.Drop) {
          const fov = hasComponent(world, entity, PlayerComponent)
            ? this.playerFOV
            : this.processFOV(position)
          const sortedFov = fov.toSorted((a, b) => {
            const distA =
              (position.x - a.x) * (position.x - a.x) +
              (position.y - a.y) * (position.y - a.y)
            const distB =
              (position.x - b.x) * (position.x - b.x) +
              (position.y - b.y) * (position.y - b.y)
            return Math.sqrt(distA) - Math.sqrt(distB)
          })

          let dropped = false
          let i = 0
          do {
            if (this.map.isWalkable(sortedFov[i].x, sortedFov[i].y)) {
              const entities = this.map.getEntitiesAtLocation(sortedFov[i])
              if (
                entities.length === 0 ||
                !entities.find((a) => hasComponent(world, a, ItemComponent))
              ) {
                dropped = true

                removeComponent(world, action.useItem, OwnerComponent)
                addComponent(world, action.useItem, PositionComponent)
                PositionComponent.position[action.useItem] = { ...sortedFov[i] }
                this.map.addEntityAtLocation(action.useItem, sortedFov[i])
              }
            }
            i++
          } while (!dropped && i < sortedFov.length)

          this.resetAction(action, true)
        } else {
          this.log.addMessage('Invalid action for an item')
          this.resetAction(action, false)
        }
      } else if (position.x === newPosition.x && position.y === newPosition.y) {
        const info = InfoComponent.info[entity]
        if (action.pickUpItem) {
          const entities = this.map.getEntitiesAtLocation(position)
          if (
            entities.length === 0 ||
            entities.find((a) => hasComponent(world, a, ItemComponent)) ===
              undefined
          ) {
            this.log.addMessage('There is no item to pick up')
            this.resetAction(action, false)
          } else {
            const item = entities.find((a) =>
              hasComponent(world, a, ItemComponent),
            )!
            removeComponent(world, item, PositionComponent)
            addComponent(world, item, OwnerComponent)
            OwnerComponent.owner[item] = {owner: entity}
            const itemInfo = InfoComponent.info[item]
            this.log.addMessage(`${info.name} picks up ${itemInfo.name}`)
            this.resetAction(action, true)
          }
        } else {
          this.log.addMessage(`${info.name} does nothing.`)
          this.resetAction(action, true)
        }
      } else if (this.map.isWalkable(newPosition.x, newPosition.y)) {
        const entities = this.map.getEntitiesAtLocation(newPosition)

        if (
          entities.length === 0 ||
          entities.find((a) => hasComponent(world, a, BlockerComponent)) ===
            undefined
        ) {
          this.handleMove(world, entity, position, newPosition)
          this.resetAction(action, true)
        } else if (entities.length > 0) {
          const blocker = entities.find((a) =>
            hasComponent(world, a, BlockerComponent),
          )
          if (blocker !== undefined) {
            const attack = addEntity(world)
            addComponent(world, attack, WantMeleeAttackComponent)

            WantMeleeAttackComponent.wantMeleeAttack[attack] = {
              attacker: entity,
              defender: blocker,
            }
            this.resetAction(action, true)
          }
        }
      } else {
        this.log.addMessage('That direction is blocked')
        this.resetAction(action, false)
      }
    }
  }

  handleMove(
    world: World,
    eid: EntityId,
    position: Position,
    newPosition: Vector2,
  ) {
    this.map.moveEntity(eid, position, newPosition)
    position.x = newPosition.x
    position.y = newPosition.y

    if (hasComponent(world, eid, PlayerComponent)) {
      this.processPlayerFOV(position)
    }
  }

  resetAction(action: Action, success: boolean) {
    action.processed = true
    action.xOffset = 0
    action.yOffset = 0
    action.useItem = undefined
    action.pickUpItem = false
    action.itemActionType = undefined
    action.actionSuccessful = success
  }

  processPlayerFOV(position: Position) {
    this.playerFOV.length = 0
    const fovPositions = this.processFOV(position)
    fovPositions.forEach((p) => {
      this.playerFOV.push({ ...p })
    })
  }

  processFOV(position: Position) {
    const fovPositions: Vector2[] = []
    const fov = new FOV.PreciseShadowcasting(
      this.map.lightPassesThrough.bind(this.map),
    )
    fov.compute(position.x, position.y, 8, (x, y, _r, visibility) => {
      if (visibility === 1) {
        this.map.tiles[x][y].seen = true

        fovPositions.push({ x, y })
      }
    })

    return fovPositions
  }
}
