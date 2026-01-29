import {
  addComponent,
  addEntity,
  hasComponent,
  query,
  type EntityId,
  type World,
} from 'bitecs'
import type { MessageLog } from '../../../utils/message-log'
import type { UpdateSystem } from './update-system'
import {
  ActionComponent,
  BlockerComponent,
  ConsumableComponent,
  HealComponent,
  HealthComponent,
  InfoComponent,
  OwnerComponent,
  PositionComponent,
  RemoveComponent,
  SpellComponent,
  WantAttackComponent,
  WantUseItemComponent,
  type Position,
  type WantUseItem,
} from '../../components'
import { FOV } from 'rot-js'
import type { Vector2 } from '../../../types'
import type { Map } from '../../../map'
import { distance } from '../../../utils/vector-2-funcs'
import { AttackType } from '../../../constants/attack-type'

export class UpdateWantUseItemSystem implements UpdateSystem {
  log: MessageLog
  map: Map

  constructor(log: MessageLog, map: Map) {
    this.log = log
    this.map = map
  }

  update(world: World, _entity: EntityId) {
    for (const eid of query(world, [WantUseItemComponent])) {
      const useItem = WantUseItemComponent.wantUseItem[eid]
      if (this.checkOwnerOwnsItem(world, useItem)) {
        if (hasComponent(world, useItem.item, ConsumableComponent)) {
          this.useConsumableItem(world, useItem)
        } else {
          this.actionError(useItem.owner, 'Invalid item type to use')
        }
      }
      addComponent(world, eid, RemoveComponent)
    }
  }

  checkOwnerOwnsItem(world: World, useItem: WantUseItem) {
    let ownerOwnsItem = true
    if (!hasComponent(world, useItem.item, OwnerComponent)) {
      this.actionError(useItem.owner, 'Invalid item selected')
      ownerOwnsItem = false
    } else {
      const itemOwner = OwnerComponent.owner[useItem.item]
      if (itemOwner.owner !== useItem.owner) {
        this.actionError(useItem.owner, 'Invalid item selected')
        ownerOwnsItem = false
      }
    }
    return ownerOwnsItem
  }

  useConsumableItem(world: World, useItem: WantUseItem) {
    if (hasComponent(world, useItem.item, HealComponent)) {
      this.processHeal(world, useItem)
    } else if (hasComponent(world, useItem.item, SpellComponent)) {
      this.processSpell(world, useItem)
    } else {
      this.actionError(useItem.owner, 'Invalid consumable item selected')
    }
  }

  processHeal(world: World, useItem: WantUseItem) {
    const heal = HealComponent.heal[useItem.item]
    const health = HealthComponent.health[useItem.owner]
    if (health.current === health.max) {
      this.actionError(useItem.owner, 'Health is already full')
    } else {
      const healAmount = Math.floor(
        Math.min(health.max - health.current, heal.amount),
      )
      health.current += healAmount
      const infoOwner = InfoComponent.info[useItem.owner]
      const infoItem = InfoComponent.info[useItem.item]
      this.actionSuccess(
        world,
        useItem.item,
        `${infoOwner.name} uses ${infoItem.name} to heal ${healAmount} hp`,
      )
    }
  }

  processSpell(world: World, useItem: WantUseItem) {
    const spell = SpellComponent.spell[useItem.item]
    if (spell.spellName === 'Lightning') {
      const position = PositionComponent.position[useItem.owner]
      const fov = this.processFOV(position, spell.range)
      const sortedFov = fov.toSorted((a, b) => {
        return distance(a, position) - distance(b, position)
      })

      let targetEntity: EntityId | undefined = undefined
      let i = 0
      do {
        const entities = this.map.getEntitiesAtLocation(sortedFov[i])
        targetEntity = entities.find(
          (a) =>
            hasComponent(world, a, BlockerComponent) &&
            hasComponent(world, a, HealthComponent),
        )

        if(targetEntity === useItem.owner){
          targetEntity = undefined
        }

        i++
      } while (targetEntity === undefined && i < sortedFov.length)

      if (targetEntity !== undefined) {
        const attack = addEntity(world)
        addComponent(world, attack, WantAttackComponent)
        WantAttackComponent.WantAttack[attack] = {
          attackType: AttackType.Spell,
          attacker: useItem.owner,
          defender: targetEntity,
          spell: spell.spellName,
        }

        this.actionSuccess(world, useItem.item, '')
      } else {
        this.actionError(useItem.owner, 'No one in targeting range')
      }
    } else {
      this.actionError(useItem.owner, 'Invalid consumable item selected')
    }
  }

  actionSuccess(world: World, item: EntityId, message: string) {
    if (message.length > 0) {
      this.log.addMessage(message)
    }
    addComponent(world, item, RemoveComponent)
  }

  actionError(owner: EntityId, error: string) {
    this.log.addMessage(error)
    const action = ActionComponent.action[owner]
    action.actionSuccessful = false
  }

  processFOV(position: Position, range: number) {
    const fovPositions: Vector2[] = []
    const fov = new FOV.PreciseShadowcasting(
      this.map.lightPassesThrough.bind(this.map),
    )
    fov.compute(position.x, position.y, range, (x, y, _r, visibility) => {
      if (visibility === 1) {
        fovPositions.push({ x, y })
      }
    })

    return fovPositions
  }
}
