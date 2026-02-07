import { addComponents, addEntity, type World } from 'bitecs'
import type { Vector2 } from '../../types'
import {
  ActionComponent,
  AliveComponent,
  BlockerComponent,
  EquipmentComponent,
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
    EquipmentComponent,
  )
  PlayerComponent.player[player] = {
    levelUpBase: 0,
    currentLevel: 1,
    currentXp: 0,
    levelUpFactor: 200,
    experienceToNextLevel: 200,
  }
  ActionComponent.action[player] = {
    processed: true,
    xOffset: 0,
    yOffset: 0,
    useItem: undefined,
    actionSuccessful: true,
    itemActionType: undefined,
    pickUpItem: false,
  }
  InfoComponent.info[player] = { name: 'Player' }
  PositionComponent.position[player] = { ...startPosition }
  RenderableComponent.renderable[player] = {
    char: '@',
    fg: Colors.Player,
    bg: null,
  }
  HealthComponent.health[player] = { current: 30, max: 30 }
  StatsComponent.stats[player] = {
    strength: 2,
    currentStrength: 2,
    defense: 0,
    currentDefense: 0,
    xpGiven: 0,
  }
  EquipmentComponent.equipment[player] = {
    armor: -1,
    weapon: -1
  }
  return player
}
