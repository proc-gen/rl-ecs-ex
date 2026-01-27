import type { EntityId } from "bitecs"

export const ActionComponent = {
  action: [] as Action[],
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
