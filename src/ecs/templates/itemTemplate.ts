import {
  addComponent,
  addComponents,
  addEntity,
  type EntityId,
  type World,
} from 'bitecs'
import type { Vector2 } from '../../types'
import { Colors } from '../../constants/colors'
import { ItemType } from '../../constants/item-type'
import { ConsumableType } from '../../constants/consumable-type'
import {
  ConfusionComponent,
  ConsumableComponent,
  HealComponent,
  InfoComponent,
  ItemComponent,
  OwnerComponent,
  PositionComponent,
  RenderableComponent,
  RenderLayerItemComponent,
  SpellComponent,
  TargetingComponent,
} from '../components'
import { TargetingType } from '../../constants/targeting-type'

export const createItem = (
  world: World,
  name: string,
  position: Vector2 | undefined,
  owner: EntityId | undefined,
) => {
  const itemStats = itemStatLookup(name)
  if (itemStats === undefined) {
    return
  }

  const item = addEntity(world)

  addComponents(
    world,
    item,
    InfoComponent,
    ItemComponent,
    RenderableComponent,
    RenderLayerItemComponent,
  )

  InfoComponent.info[item] = { name }
  RenderableComponent.renderable[item] = {
    char: itemStats.char,
    fg: itemStats.fg,
    bg: itemStats.bg,
  }

  if (position !== undefined) {
    addComponent(world, item, PositionComponent)
    PositionComponent.position[item] = { ...position }
  }

  if (owner !== undefined) {
    addComponent(world, item, OwnerComponent)
    OwnerComponent.owner[item] = { owner }
  }

  if (itemStats.itemType === ItemType.Consumable) {
    createConsumableComponents(world, item, name)
  }

  createEffectComponents(world, item, name)
}

const createConsumableComponents = (
  world: World,
  item: EntityId,
  name: string,
) => {
  const consumableStats = consumableStatLookup(name)
  if (consumableStats === undefined) {
    return
  }

  addComponent(world, item, ConsumableComponent)

  if (consumableStats.consumableType === ConsumableType.Heal) {
    addComponent(world, item, HealComponent)
    HealComponent.heal[item] = { amount: consumableStats.damage * -1 }
  } else if (consumableStats.consumableType === ConsumableType.Spell) {
    addComponent(world, item, SpellComponent)
    SpellComponent.spell[item] = {
      range: consumableStats.range,
      damage: consumableStats.damage,
      spellName: consumableStats.spellName,
    }
  }
}

const createEffectComponents = (world: World, item: EntityId, name: string) => {
  if (name === 'Confusion Scroll') {
    addComponents(world, item, ConfusionComponent, TargetingComponent)
    ConfusionComponent.confusion[item] = { turnsLeft: 10 }
    TargetingComponent.targeting[item] = {
      targetingType: TargetingType.SingleTargetEntity,
      position: { x: 0, y: 0 },
    }
  } else if(name === 'Fireball Scroll') {
    TargetingComponent.targeting[item] = {
      targetingType: TargetingType.SingleTargetPosition,
      position: { x: 0, y: 0 },
    }

    SpellComponent.spell[item].radius = 3
  }
}

const itemStatLookup = (name: string) => {
  if (name === 'Health Potion') {
    return {
      char: '¡',
      itemType: ItemType.Consumable,
      fg: Colors.HealthBar,
      bg: null,
    }
  } else if (name === 'Lightning Scroll') {
    return {
      char: '~',
      itemType: ItemType.Consumable,
      fg: Colors.LightningScroll,
      bg: null,
    }
  } else if (name === 'Confusion Scroll') {
    return {
      char: '~',
      itemType: ItemType.Consumable,
      fg: Colors.ConfusionScroll,
      bg: null,
    }
  } else if (name === 'Fireball Scroll') {
    return {
      char: '~',
      itemType: ItemType.Consumable,
      fg: Colors.FireballScroll,
      bg: null,
    }
  }

  return undefined
}

const consumableStatLookup = (name: string) => {
  if (name === 'Health Potion') {
    return {
      consumableType: ConsumableType.Heal,
      damage: -4,
      amount: 1,
      range: 0,
      spellName: '',
    }
  } else if (name === 'Lightning Scroll') {
    return {
      consumableType: ConsumableType.Spell,
      amount: 1,
      damage: 20,
      range: 5,
      spellName: 'Lightning',
    }
  } else if (name === 'Confusion Scroll') {
    return {
      consumableType: ConsumableType.Spell,
      amount: 1,
      damage: 0,
      range: 8,
      spellName: 'Confusion',
    }
  } else if (name === 'Fireball Scroll') {
    return {
      consumableType: ConsumableType.Spell,
      amount: 1,
      damage: 12,
      range: 8,
      spellName: 'Fireball',
    }
  }

  return undefined
}
