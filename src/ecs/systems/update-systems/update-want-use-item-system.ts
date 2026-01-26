import {
  addComponent,
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
  RemoveComponent,
  WantUseItemComponent,
  type WantUseItem,
} from '../../components'

export class UpdateWantUseItemSystem implements UpdateSystem {
  log: MessageLog

  constructor(log: MessageLog) {
    this.log = log
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
    } else {
      this.actionError(useItem.owner, 'Invalid consumable item selected')
    }
  }

  actionSuccess(world: World, item: EntityId, message: string) {
    this.log.addMessage(message)
    addComponent(world, item, RemoveComponent)
  }

  actionError(owner: EntityId, error: string) {
    this.log.addMessage(error)
    const action = ActionComponent.action[owner]
    action.actionSuccessful = false
  }
}
