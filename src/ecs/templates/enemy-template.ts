import { addComponents, addEntity, type World } from 'bitecs'
import type { Vector2 } from '../../types'
import {
  ActionComponent,
  BlockerComponent,
  InfoComponent,
  EnemyComponent,
  PositionComponent,
  RenderableComponent,
  AliveComponent,
  HealthComponent,
  StatsComponent,
  RenderLayerBlockerComponent,
  EquipmentComponent,
} from '../components'
import { Colors } from '../../constants/colors'

export const createEnemy = (
  world: World,
  startPosition: Vector2,
  name: string,
) => {
  const enemyStats = enemyStatLookup(name)
  if (enemyStats === undefined) {
    return
  }

  const enemy = addEntity(world)

  addComponents(
    world,
    enemy,
    ActionComponent,
    BlockerComponent,
    InfoComponent,
    EnemyComponent,
    PositionComponent,
    RenderableComponent,
    RenderLayerBlockerComponent,
    AliveComponent,
    HealthComponent,
    StatsComponent,
    EquipmentComponent,
  )
  ActionComponent.values[enemy] = {
    processed: true,
    xOffset: 0,
    yOffset: 0,
    useItem: undefined,
    actionSuccessful: true,
    pickUpItem: false,
    itemActionType: undefined,
  }
  InfoComponent.values[enemy] = { name }
  PositionComponent.values[enemy] = { ...startPosition }
  RenderableComponent.values[enemy] = {
    char: enemyStats.char,
    fg: enemyStats.fg,
    bg: enemyStats.bg,
  }
  HealthComponent.values[enemy] = {
    current: enemyStats.health,
    max: enemyStats.health,
  }
  StatsComponent.values[enemy] = {
    strength: enemyStats.strength,
    currentStrength: enemyStats.strength,
    defense: enemyStats.defense,
    currentDefense: enemyStats.defense,
    xpGiven: enemyStats.xpGiven,
  }
  EquipmentComponent.values[enemy] = {
    armor: -1,
    weapon: -1,
  }
  return enemy
}

const enemyStatLookup = (name: string) => {
  if (name === 'Orc') {
    return {
      char: 'o',
      fg: Colors.Orc,
      bg: null,
      health: 10,
      strength: 3,
      defense: 0,
      xpGiven: 35,
    }
  } else if (name === 'Troll') {
    return {
      char: 't',
      fg: Colors.Troll,
      bg: null,
      health: 16,
      strength: 4,
      defense: 1,
      xpGiven: 100,
    }
  }

  return undefined
}
