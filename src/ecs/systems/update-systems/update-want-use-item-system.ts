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
  ConsumableComponent,
  HealComponent,
  HealthComponent,
  InfoComponent,
  OwnerComponent,
  PositionComponent,
  RemoveComponent,
  SpellComponent,
  TargetingComponent,
  WantAttackComponent,
  WantCauseSpellEffectComponent,
  WantUseItemComponent,
  type Spell,
  type Targeting,
  type WantUseItem,
} from '../../components'
import type { Map } from '../../../map'
import { distance } from '../../../utils/vector-2-funcs'
import { AttackType } from '../../../constants/attack-type'
import { processFOV } from '../../../utils/fov-funcs'
import { TargetingType } from '../../../constants/targeting-type'
import type { Vector2 } from '../../../types'

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
    if (!hasComponent(world, useItem.item, TargetingComponent)) {
      this.processRandomTargetSpell(world, useItem, spell)
    } else if (hasComponent(world, useItem.item, TargetingComponent)) {
      const targeting = TargetingComponent.targeting[useItem.item]
      if (targeting.targetingType === TargetingType.SingleTargetEntity) {
        this.processSingleTargetEntitySpell(world, useItem, spell, targeting)
      } else if(targeting.targetingType === TargetingType.SingleTargetPosition){
        this.processSingleTargetPositionSpell(world, useItem, spell, targeting)
      }
    } else {
      this.actionError(useItem.owner, 'Invalid consumable item selected')
    }
  }

  processRandomTargetSpell(world: World, useItem: WantUseItem, spell: Spell) {
    const position = PositionComponent.position[useItem.owner]
    const fov = processFOV(this.map, position, spell.range)
    const sortedFov = fov.toSorted((a, b) => {
      return distance(a, position) - distance(b, position)
    })

    let targetEntity: EntityId | undefined = undefined
    let i = 0
    do {
      const entities = this.map.getEntitiesAtLocation(sortedFov[i])
      targetEntity = entities.find((a) =>
        hasComponent(world, a, HealthComponent),
      )

      if (targetEntity === useItem.owner) {
        targetEntity = undefined
      }

      i++
    } while (targetEntity === undefined && i < sortedFov.length)

    if (targetEntity !== undefined) {
      if (spell.damage > 0) {
        this.processWantAttack(world, useItem, targetEntity)
      }
      if (this.hasSpellEffect(spell.spellName)) {
        this.processWantSpellEffect(world, useItem, targetEntity)
      }
      this.actionSuccess(world, useItem.item, '')
    } else {
      this.actionError(useItem.owner, 'No one in targeting range')
    }
  }

  processSingleTargetEntitySpell(
    world: World,
    useItem: WantUseItem,
    spell: Spell,
    targeting: Targeting,
  ) {
    let targets: Vector2[] = [targeting.position]
    const targetEntities: EntityId[] = []

    if (spell.radius !== undefined) {
      targets = processFOV(this.map, targeting.position, spell.radius)
    }

    targets.forEach((t) => {
      const entities = this.map.getEntitiesAtLocation(t)
      const targetEntity = entities.find((a) =>
        hasComponent(world, a, HealthComponent),
      )
      if (targetEntity !== undefined) {
        targetEntities.push(targetEntity)
      }
    })

    if (targetEntities.length > 0) {
      targetEntities.forEach((e) => {
        if (spell.damage > 0) {
          this.processWantAttack(world, useItem, e)
        }
        if (this.hasSpellEffect(spell.spellName)) {
          this.processWantSpellEffect(world, useItem, e)
        }
      })
      this.actionSuccess(world, useItem.item, '')
    } else {
      this.actionError(useItem.owner, 'Invalid target selected')
    }
  }

  processSingleTargetPositionSpell(
    world: World,
    useItem: WantUseItem,
    spell: Spell,
    targeting: Targeting,
  ) {
    let targets: Vector2[] = [targeting.position]
    const targetEntities: EntityId[] = []

    if (spell.radius !== undefined) {
      targets = processFOV(this.map, targeting.position, spell.radius)
    }
    targets.forEach((t) => {
      const entities = this.map.getEntitiesAtLocation(t)
      const targetEntity = entities.find((a) =>
        hasComponent(world, a, HealthComponent),
      )
      if (targetEntity !== undefined) {
        targetEntities.push(targetEntity)
      }
    })

    if (targetEntities.length > 0) {
      targetEntities.forEach((e) => {
        if (spell.damage > 0) {
          this.processWantAttack(world, useItem, e)
        }
        if (this.hasSpellEffect(spell.spellName)) {
          this.processWantSpellEffect(world, useItem, e)
        }
      })
      this.actionSuccess(world, useItem.item, '')
    } else {
      this.actionError(useItem.owner, 'Invalid target selected')
    }
  }

  processWantAttack(
    world: World,
    useItem: WantUseItem,
    targetEntity: EntityId,
  ) {
    const attack = addEntity(world)
    addComponent(world, attack, WantAttackComponent)
    WantAttackComponent.WantAttack[attack] = {
      attackType: AttackType.Spell,
      attacker: useItem.owner,
      defender: targetEntity,
      spell: useItem.item,
    }
  }

  processWantSpellEffect(
    world: World,
    useItem: WantUseItem,
    targetEntity: EntityId,
  ) {
    const effect = addEntity(world)
    addComponent(world, effect, WantCauseSpellEffectComponent)
    WantCauseSpellEffectComponent.effect[effect] = {
      attacker: useItem.owner,
      defender: targetEntity,
      spell: useItem.item,
    }
  }

  hasSpellEffect(spellName: string) {
    let hasEffect = false
    if (spellName === 'Confusion') {
      hasEffect = true
    }
    return hasEffect
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
}
