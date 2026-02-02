import { addComponent, type EntityId, type World } from 'bitecs'
import {
  ActionComponent,
  AliveComponent,
  BlockerComponent,
  ConfusionComponent,
  ConsumableComponent,
  DeadComponent,
  EnemyComponent,
  HealComponent,
  HealthComponent,
  InfoComponent,
  ItemComponent,
  OwnerComponent,
  PlayerComponent,
  PositionComponent,
  RemoveComponent,
  RenderableComponent,
  RenderLayerBlockerComponent,
  RenderLayerGroundComponent,
  RenderLayerItemComponent,
  SpellComponent,
  StatsComponent,
  TargetingComponent,
  WantAttackComponent,
  WantCauseSpellEffectComponent,
  WantUseItemComponent,
} from '.'

export const WorldComponents = [
  ActionComponent,
  AliveComponent,
  BlockerComponent,
  ConfusionComponent,
  ConsumableComponent,
  DeadComponent,
  EnemyComponent,
  HealComponent,
  HealthComponent,
  InfoComponent,
  ItemComponent,
  OwnerComponent,
  PlayerComponent,
  PositionComponent,
  RemoveComponent,
  RenderableComponent,
  RenderLayerGroundComponent,
  RenderLayerItemComponent,
  RenderLayerBlockerComponent,
  SpellComponent,
  StatsComponent,
  TargetingComponent,
  WantAttackComponent,
  WantUseItemComponent,
  WantCauseSpellEffectComponent,
]

export const getDataFromComponent = (entity: EntityId, componentType: any) => {
  const componentData = {
    componentType: '',
    data: {},
  }

  switch (componentType) {
    case ActionComponent:
      componentData.componentType = 'ActionComponent'
      componentData.data = ActionComponent.action[entity]
      break
    case AliveComponent:
      componentData.componentType = 'AliveComponent'
      componentData.data = AliveComponent.alive[entity]
      break
    case BlockerComponent:
      componentData.componentType = 'BlockerComponent'
      componentData.data = BlockerComponent.blocker[entity]
      break
    case ConfusionComponent:
      componentData.componentType = 'ConfusionComponent'
      componentData.data = ConfusionComponent.confusion[entity]
      break
    case ConsumableComponent:
      componentData.componentType = 'ConsumableComponent'
      componentData.data = ConsumableComponent.consumable[entity]
      break
    case DeadComponent:
      componentData.componentType = 'DeadComponent'
      componentData.data = DeadComponent.dead[entity]
      break
    case EnemyComponent:
      componentData.componentType = 'EnemyComponent'
      componentData.data = EnemyComponent.enemy[entity]
      break
    case HealComponent:
      componentData.componentType = 'HealComponent'
      componentData.data = HealComponent.heal[entity]
      break
    case HealthComponent:
      componentData.componentType = 'HealthComponent'
      componentData.data = HealthComponent.health[entity]
      break
    case InfoComponent:
      componentData.componentType = 'InfoComponent'
      componentData.data = InfoComponent.info[entity]
      break
    case ItemComponent:
      componentData.componentType = 'ItemComponent'
      componentData.data = ItemComponent.item[entity]
      break
    case OwnerComponent:
      componentData.componentType = 'OwnerComponent'
      componentData.data = OwnerComponent.owner[entity]
      break
    case PlayerComponent:
      componentData.componentType = 'PlayerComponent'
      componentData.data = PlayerComponent.player[entity]
      break
    case PositionComponent:
      componentData.componentType = 'PositionComponent'
      componentData.data = PositionComponent.position[entity]
      break
    case RemoveComponent:
      componentData.componentType = 'RemoveComponent'
      componentData.data = RemoveComponent.remove[entity]
      break
    case RenderableComponent:
      componentData.componentType = 'RenderableComponent'
      componentData.data = RenderableComponent.renderable[entity]
      break
    case RenderLayerGroundComponent:
      componentData.componentType = 'RenderLayerGroundComponent'
      componentData.data = RenderLayerGroundComponent.renderLayer[entity]
      break
    case RenderLayerItemComponent:
      componentData.componentType = 'RenderLayerItemComponent'
      componentData.data = RenderLayerItemComponent.renderLayer[entity]
      break
    case RenderLayerBlockerComponent:
      componentData.componentType = 'RenderLayerBlockerComponent'
      componentData.data = RenderLayerBlockerComponent.renderLayer[entity]
      break
    case SpellComponent:
      componentData.componentType = 'SpellComponent'
      componentData.data = SpellComponent.spell[entity]
      break
    case StatsComponent:
      componentData.componentType = 'StatsComponent'
      componentData.data = StatsComponent.stats[entity]
      break
    case TargetingComponent:
      componentData.componentType = 'TargetingComponent'
      componentData.data = TargetingComponent.targeting[entity]
      break
    case WantAttackComponent:
      componentData.componentType = 'WantAttackComponent'
      componentData.data = WantAttackComponent.WantAttack[entity]
      break
    case WantUseItemComponent:
      componentData.componentType = 'WantUseItemComponent'
      componentData.data = WantUseItemComponent.wantUseItem[entity]
      break
    case WantCauseSpellEffectComponent:
      componentData.componentType = 'WantCauseSpellEffectComponent'
      componentData.data = WantCauseSpellEffectComponent.effect[entity]
      break
  }

  return componentData
}

export const setDataForComponent = (
  world: World,
  entity: EntityId,
  componentType: string,
  data: any,
) => {
  switch (componentType) {
    case 'ActionComponent':
      addComponent(world, entity, ActionComponent)
      ActionComponent.action[entity] = data
      break
    case 'AliveComponent':
      addComponent(world, entity, AliveComponent)
      AliveComponent.alive[entity] = data
      break
    case 'BlockerComponent':
      addComponent(world, entity, BlockerComponent)
      BlockerComponent.blocker[entity] = data
      break
    case 'ConfusionComponent':
      addComponent(world, entity, ConfusionComponent)
      ConfusionComponent.confusion[entity] = data
      break
    case 'ConsumableComponent':
      addComponent(world, entity, ConsumableComponent)
      ConsumableComponent.consumable[entity] = data
      break
    case 'DeadComponent':
      addComponent(world, entity, DeadComponent)
      DeadComponent.dead[entity] = data
      break
    case 'EnemyComponent':
      addComponent(world, entity, EnemyComponent)
      EnemyComponent.enemy[entity] = data
      break
    case 'HealComponent':
      addComponent(world, entity, HealComponent)
      HealComponent.heal[entity] = data
      break
    case 'HealthComponent':
      addComponent(world, entity, HealthComponent)
      HealthComponent.health[entity] = data
      break
    case 'InfoComponent':
      addComponent(world, entity, InfoComponent)
      InfoComponent.info[entity] = data
      break
    case 'ItemComponent':
      addComponent(world, entity, ItemComponent)
      ItemComponent.item[entity] = data
      break
    case 'OwnerComponent':
      addComponent(world, entity, OwnerComponent)
      OwnerComponent.owner[entity] = data
      break
    case 'PlayerComponent':
      addComponent(world, entity, PlayerComponent)
      PlayerComponent.player[entity] = data
      break
    case 'PositionComponent':
      addComponent(world, entity, PositionComponent)
      PositionComponent.position[entity] = data
      break
    case 'RemoveComponent':
      addComponent(world, entity, RemoveComponent)
      RemoveComponent.remove[entity] = data
      break
    case 'RenderableComponent':
      addComponent(world, entity, RenderableComponent)
      RenderableComponent.renderable[entity] = data
      break
    case 'RenderLayerGroundComponent':
      addComponent(world, entity, RenderLayerGroundComponent)
      RenderLayerGroundComponent.renderLayer[entity] = data
      break
    case 'RenderLayerItemComponent':
      addComponent(world, entity, RenderLayerItemComponent)
      RenderLayerItemComponent.renderLayer[entity] = data
      break
    case 'RenderLayerBlockerComponent':
      addComponent(world, entity, RenderLayerBlockerComponent)
      RenderLayerBlockerComponent.renderLayer[entity] = data
      break
    case 'SpellComponent':
      addComponent(world, entity, SpellComponent)
      SpellComponent.spell[entity] = data
      break
    case 'StatsComponent':
      addComponent(world, entity, StatsComponent)
      StatsComponent.stats[entity] = data
      break
    case 'TargetingComponent':
      addComponent(world, entity, TargetingComponent)
      TargetingComponent.targeting[entity] = data
      break
    case 'WantAttackComponent':
      addComponent(world, entity, WantAttackComponent)
      WantAttackComponent.WantAttack[entity] = data
      break
    case 'WantUseItemComponent':
      addComponent(world, entity, WantUseItemComponent)
      WantUseItemComponent.wantUseItem[entity] = data
      break
    case 'WantCauseSpellEffectComponent':
      addComponent(world, entity, WantCauseSpellEffectComponent)
      WantCauseSpellEffectComponent.effect[entity] = data
      break
  }
}
