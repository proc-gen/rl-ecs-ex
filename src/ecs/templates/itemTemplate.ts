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
  ConsumableComponent,
  HealComponent,
  InfoComponent,
  ItemComponent,
  OwnerComponent,
  PositionComponent,
  RenderableComponent,
  RenderLayerItemComponent,
} from '../components'

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
    HealComponent.heal[item] = { amount: consumableStats.amount }
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
  }

  return undefined
}

const consumableStatLookup = (name: string) => {
  if (name === 'Health Potion') {
    return {
      consumableType: ConsumableType.Heal,
      amount: 4,
    }
  }

  return undefined
}
