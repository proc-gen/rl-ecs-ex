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
  )
  ActionComponent.action[enemy] = { processed: true, xOffset: 0, yOffset: 0 }
  InfoComponent.info[enemy] = { name }
  PositionComponent.position[enemy] = { x: startPosition.x, y: startPosition.y }
  RenderableComponent.renderable[enemy] = {
    char: enemyStats.char,
    fg: enemyStats.fg,
    bg: enemyStats.bg,
  }
  HealthComponent.health[enemy] = {
    current: enemyStats.health,
    max: enemyStats.health,
  }
  StatsComponent.stats[enemy] = {
    strength: enemyStats.strength,
    defense: enemyStats.defense,
  }

  return enemy
}

const enemyStatLookup = (name: string) => {
  if (name === 'Orc') {
    return {
      char: 'o',
      fg: Colors.Orc,
      bg: Colors.Black,
      health: 10,
      strength: 3,
      defense: 0,
    }
  } else if (name === 'Troll') {
    return {
      char: 't',
      fg: Colors.Troll,
      bg: Colors.Black,
      health: 16,
      strength: 4,
      defense: 1,
    }
  }

  return undefined
}
