import type { EntityId } from "bitecs"

export const ActionComponent = {
  action: [] as Action[],
}

export type Action = {
  processed: boolean
  xOffset: number
  yOffset: number
  useItem: EntityId | undefined
  pickUpItem: boolean
  actionSuccessful: boolean
}
