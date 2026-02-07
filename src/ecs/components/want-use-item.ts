import type { EntityId } from 'bitecs'
import type { Component } from './component'

export const WantUseItemComponent: Component<WantUseItem> = {
  values: [] as WantUseItem[],
}

export type WantUseItem = {
  owner: EntityId
  item: EntityId
}
