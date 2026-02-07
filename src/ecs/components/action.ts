import type { EntityId } from 'bitecs'
import type { Component } from './component'

export const ActionComponent: Component<Action> = {
  values: [] as Action[],
}

export type Action = {
  processed: boolean
  xOffset: number
  yOffset: number
  useItem: EntityId | undefined
  itemActionType: string | undefined
  pickUpItem: boolean
  actionSuccessful: boolean
}
