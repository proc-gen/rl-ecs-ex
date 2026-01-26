import type { EntityId } from 'bitecs'

export const WantUseItemComponent = {
  wantUseItem: [] as WantUseItem[],
}

export type WantUseItem = {
  owner: EntityId
  item: EntityId
}
