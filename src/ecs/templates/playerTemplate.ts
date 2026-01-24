import { addComponents, addEntity, type World } from 'bitecs'
import type { Vector2 } from '../../types'
import {
  ActionComponent,
  AliveComponent,
  BlockerComponent,
  HealthComponent,
  InfoComponent,
  PlayerComponent,
  PositionComponent,
  RenderableComponent,
  RenderLayerBlockerComponent,
  StatsComponent,
} from '../components'
import { Colors } from '../../constants/colors'

export const createPlayer = (world: World, startPosition: Vector2) => {
  const player = addEntity(world)

  addComponents(
    world,
    player,
    ActionComponent,
    BlockerComponent,
    InfoComponent,
    PlayerComponent,
    PositionComponent,
    RenderableComponent,
    RenderLayerBlockerComponent,
    AliveComponent,
    HealthComponent,
    StatsComponent,
  )
  ActionComponent.action[player] = { processed: true, xOffset: 0, yOffset: 0 }
  InfoComponent.info[player] = { name: 'Player' }
  PositionComponent.position[player] = {...startPosition}
  RenderableComponent.renderable[player] = {
    char: '@',
    fg: Colors.Player,
    bg: null,
  }
  HealthComponent.health[player] = { current: 30, max: 30 }
  StatsComponent.stats[player] = { strength: 5, defense: 2 }
  return player
}
