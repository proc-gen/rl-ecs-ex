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
  ArmorComponent,
  ConfusionComponent,
  ConsumableComponent,
  EquippableComponent,
  HealComponent,
  InfoComponent,
  ItemComponent,
  OwnerComponent,
  PositionComponent,
  RenderableComponent,
  RenderLayerItemComponent,
  SpellComponent,
  TargetingComponent,
  WeaponComponent,
} from '../components'
import { TargetingType } from '../../constants/targeting-type'
import { EquipmentType } from '../../constants/equipment-type'

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

  InfoComponent.values[item] = { name }
  RenderableComponent.values[item] = {
    char: itemStats.char,
    fg: itemStats.fg,
    bg: itemStats.bg,
  }

  if (position !== undefined) {
    addComponent(world, item, PositionComponent)
    PositionComponent.values[item] = { ...position }
  }

  if (owner !== undefined) {
    addComponent(world, item, OwnerComponent)
    OwnerComponent.values[item] = { owner }
  }

  if (itemStats.itemType === ItemType.Consumable) {
    createConsumableComponents(world, item, name)
  } else if (itemStats.itemType === ItemType.Equipment) {
    createEquipmentComponents(world, item, name, owner)
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
    HealComponent.values[item] = { amount: consumableStats.damage * -1 }
  } else if (consumableStats.consumableType === ConsumableType.Spell) {
    addComponent(world, item, SpellComponent)
    SpellComponent.values[item] = {
      range: consumableStats.range,
      damage: consumableStats.damage,
      spellName: consumableStats.spellName,
    }
  }
}

const createEquipmentComponents = (
  world: World,
  item: EntityId,
  name: string,
  owner: EntityId | undefined,
) => {
  const eqipmentStats = eqipmentStatLookup(name)
  if (eqipmentStats === undefined) {
    return
  }

  addComponent(world, item, EquippableComponent)
  EquippableComponent.values[item] = {
    equipped: owner !== undefined,
  }
  if (eqipmentStats.equipmentType === EquipmentType.Armor) {
    addComponent(world, item, ArmorComponent)
    ArmorComponent.values[item] = { defense: eqipmentStats.amount }
  } else if (eqipmentStats.equipmentType === EquipmentType.Weapon) {
    addComponent(world, item, WeaponComponent)
    WeaponComponent.values[item] = { attack: eqipmentStats.amount }
  }
}

const createEffectComponents = (world: World, item: EntityId, name: string) => {
  if (name === 'Confusion Scroll') {
    addComponents(world, item, ConfusionComponent, TargetingComponent)
    ConfusionComponent.values[item] = { turnsLeft: 10 }
    TargetingComponent.values[item] = {
      targetingType: TargetingType.SingleTargetEntity,
      position: { x: 0, y: 0 },
    }
  } else if (name === 'Fireball Scroll') {
    addComponent(world, item, TargetingComponent)
    TargetingComponent.values[item] = {
      targetingType: TargetingType.SingleTargetPosition,
      position: { x: 0, y: 0 },
    }

    SpellComponent.values[item].radius = 3
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
  } else if (name === 'Dagger') {
    return {
      char: '/',
      itemType: ItemType.Equipment,
      fg: Colors.WeaponPickup,
      bg: null,
    }
  } else if (name === 'Sword') {
    return {
      char: '/',
      itemType: ItemType.Equipment,
      fg: Colors.WeaponPickup,
      bg: null,
    }
  } else if (name === 'Leather Armor') {
    return {
      char: '[',
      itemType: ItemType.Equipment,
      fg: Colors.ArmorPickup,
      bg: null,
    }
  } else if (name === 'Chain Mail') {
    return {
      char: '[',
      itemType: ItemType.Equipment,
      fg: Colors.ArmorPickup,
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

const eqipmentStatLookup = (name: string) => {
  if (name === 'Dagger') {
    return {
      equipmentType: EquipmentType.Weapon,
      amount: 2,
    }
  } else if (name === 'Sword') {
    return {
      equipmentType: EquipmentType.Weapon,
      amount: 4,
    }
  } else if (name === 'Leather Armor') {
    return {
      equipmentType: EquipmentType.Armor,
      amount: 1,
    }
  } else if (name === 'Chain Mail') {
    return {
      equipmentType: EquipmentType.Armor,
      amount: 3,
    }
  }

  return undefined
}
