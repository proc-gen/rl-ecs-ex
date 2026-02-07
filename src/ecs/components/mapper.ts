import { addComponent, type EntityId, type World } from 'bitecs'
import {
  ActionComponent,
  AliveComponent,
  ArmorComponent,
  BlockerComponent,
  ConfusionComponent,
  ConsumableComponent,
  DeadComponent,
  EnemyComponent,
  EquippableComponent,
  EquipmentComponent,
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
  WeaponComponent,
} from '.'

export const WorldComponents = [
  ActionComponent,
  AliveComponent,
  ArmorComponent,
  BlockerComponent,
  ConfusionComponent,
  ConsumableComponent,
  DeadComponent,
  EnemyComponent,
  EquippableComponent,
  EquipmentComponent,
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
  WeaponComponent,
]

export const getDataFromComponent = (entity: EntityId, componentType: any) => {
  const componentData = {
    componentType: '',
    data: {},
  }

  switch (componentType) {
    case ActionComponent:
      componentData.componentType = 'ActionComponent'
      componentData.data = ActionComponent.values[entity]
      break
    case AliveComponent:
      componentData.componentType = 'AliveComponent'
      componentData.data = AliveComponent.values[entity]
      break
    case ArmorComponent:
      componentData.componentType = 'ArmorComponent'
      componentData.data = ArmorComponent.values[entity]
      break
    case BlockerComponent:
      componentData.componentType = 'BlockerComponent'
      componentData.data = BlockerComponent.values[entity]
      break
    case ConfusionComponent:
      componentData.componentType = 'ConfusionComponent'
      componentData.data = ConfusionComponent.values[entity]
      break
    case ConsumableComponent:
      componentData.componentType = 'ConsumableComponent'
      componentData.data = ConsumableComponent.values[entity]
      break
    case DeadComponent:
      componentData.componentType = 'DeadComponent'
      componentData.data = DeadComponent.values[entity]
      break
    case EnemyComponent:
      componentData.componentType = 'EnemyComponent'
      componentData.data = EnemyComponent.values[entity]
      break
    case EquippableComponent:
      componentData.componentType = 'EquippableComponent'
      componentData.data = EquippableComponent.values[entity]
      break
    case EquipmentComponent:
      componentData.componentType = 'EquipmentComponent'
      componentData.data = EquipmentComponent.values[entity]
      break
    case HealComponent:
      componentData.componentType = 'HealComponent'
      componentData.data = HealComponent.values[entity]
      break
    case HealthComponent:
      componentData.componentType = 'HealthComponent'
      componentData.data = HealthComponent.values[entity]
      break
    case InfoComponent:
      componentData.componentType = 'InfoComponent'
      componentData.data = InfoComponent.values[entity]
      break
    case ItemComponent:
      componentData.componentType = 'ItemComponent'
      componentData.data = ItemComponent.values[entity]
      break
    case OwnerComponent:
      componentData.componentType = 'OwnerComponent'
      componentData.data = OwnerComponent.values[entity]
      break
    case PlayerComponent:
      componentData.componentType = 'PlayerComponent'
      componentData.data = PlayerComponent.values[entity]
      break
    case PositionComponent:
      componentData.componentType = 'PositionComponent'
      componentData.data = PositionComponent.values[entity]
      break
    case RemoveComponent:
      componentData.componentType = 'RemoveComponent'
      componentData.data = RemoveComponent.values[entity]
      break
    case RenderableComponent:
      componentData.componentType = 'RenderableComponent'
      componentData.data = RenderableComponent.values[entity]
      break
    case RenderLayerGroundComponent:
      componentData.componentType = 'RenderLayerGroundComponent'
      componentData.data = RenderLayerGroundComponent.values[entity]
      break
    case RenderLayerItemComponent:
      componentData.componentType = 'RenderLayerItemComponent'
      componentData.data = RenderLayerItemComponent.values[entity]
      break
    case RenderLayerBlockerComponent:
      componentData.componentType = 'RenderLayerBlockerComponent'
      componentData.data = RenderLayerBlockerComponent.values[entity]
      break
    case SpellComponent:
      componentData.componentType = 'SpellComponent'
      componentData.data = SpellComponent.values[entity]
      break
    case StatsComponent:
      componentData.componentType = 'StatsComponent'
      componentData.data = StatsComponent.values[entity]
      break
    case TargetingComponent:
      componentData.componentType = 'TargetingComponent'
      componentData.data = TargetingComponent.values[entity]
      break
    case WantAttackComponent:
      componentData.componentType = 'WantAttackComponent'
      componentData.data = WantAttackComponent.values[entity]
      break
    case WantUseItemComponent:
      componentData.componentType = 'WantUseItemComponent'
      componentData.data = WantUseItemComponent.values[entity]
      break
    case WantCauseSpellEffectComponent:
      componentData.componentType = 'WantCauseSpellEffectComponent'
      componentData.data = WantCauseSpellEffectComponent.values[entity]
      break
    case WeaponComponent:
      componentData.componentType = 'WeaponComponent'
      componentData.data = WeaponComponent.values[entity]
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
      ActionComponent.values[entity] = data
      break
    case 'AliveComponent':
      addComponent(world, entity, AliveComponent)
      AliveComponent.values[entity] = data
      break
    case 'ArmorComponent':
      addComponent(world, entity, ArmorComponent)
      ArmorComponent.values[entity] = data
      break
    case 'BlockerComponent':
      addComponent(world, entity, BlockerComponent)
      BlockerComponent.values[entity] = data
      break
    case 'ConfusionComponent':
      addComponent(world, entity, ConfusionComponent)
      ConfusionComponent.values[entity] = data
      break
    case 'ConsumableComponent':
      addComponent(world, entity, ConsumableComponent)
      ConsumableComponent.values[entity] = data
      break
    case 'DeadComponent':
      addComponent(world, entity, DeadComponent)
      DeadComponent.values[entity] = data
      break
    case 'EnemyComponent':
      addComponent(world, entity, EnemyComponent)
      EnemyComponent.values[entity] = data
      break
    case 'EquippableComponent':
      addComponent(world, entity, EquippableComponent)
      EquippableComponent.values[entity] = data
      break
    case 'EquipmentComponent':
      addComponent(world, entity, EquipmentComponent)
      EquipmentComponent.values[entity] = data
      break
    case 'HealComponent':
      addComponent(world, entity, HealComponent)
      HealComponent.values[entity] = data
      break
    case 'HealthComponent':
      addComponent(world, entity, HealthComponent)
      HealthComponent.values[entity] = data
      break
    case 'InfoComponent':
      addComponent(world, entity, InfoComponent)
      InfoComponent.values[entity] = data
      break
    case 'ItemComponent':
      addComponent(world, entity, ItemComponent)
      ItemComponent.values[entity] = data
      break
    case 'OwnerComponent':
      addComponent(world, entity, OwnerComponent)
      OwnerComponent.values[entity] = data
      break
    case 'PlayerComponent':
      addComponent(world, entity, PlayerComponent)
      PlayerComponent.values[entity] = data
      break
    case 'PositionComponent':
      addComponent(world, entity, PositionComponent)
      PositionComponent.values[entity] = data
      break
    case 'RemoveComponent':
      addComponent(world, entity, RemoveComponent)
      RemoveComponent.values[entity] = data
      break
    case 'RenderableComponent':
      addComponent(world, entity, RenderableComponent)
      RenderableComponent.values[entity] = data
      break
    case 'RenderLayerGroundComponent':
      addComponent(world, entity, RenderLayerGroundComponent)
      RenderLayerGroundComponent.values[entity] = data
      break
    case 'RenderLayerItemComponent':
      addComponent(world, entity, RenderLayerItemComponent)
      RenderLayerItemComponent.values[entity] = data
      break
    case 'RenderLayerBlockerComponent':
      addComponent(world, entity, RenderLayerBlockerComponent)
      RenderLayerBlockerComponent.values[entity] = data
      break
    case 'SpellComponent':
      addComponent(world, entity, SpellComponent)
      SpellComponent.values[entity] = data
      break
    case 'StatsComponent':
      addComponent(world, entity, StatsComponent)
      StatsComponent.values[entity] = data
      break
    case 'TargetingComponent':
      addComponent(world, entity, TargetingComponent)
      TargetingComponent.values[entity] = data
      break
    case 'WantAttackComponent':
      addComponent(world, entity, WantAttackComponent)
      WantAttackComponent.values[entity] = data
      break
    case 'WantUseItemComponent':
      addComponent(world, entity, WantUseItemComponent)
      WantUseItemComponent.values[entity] = data
      break
    case 'WantCauseSpellEffectComponent':
      addComponent(world, entity, WantCauseSpellEffectComponent)
      WantCauseSpellEffectComponent.values[entity] = data
      break
    case 'WeaponComponent':
      addComponent(world, entity, WeaponComponent)
      WeaponComponent.values[entity] = data
      break
  }
}
