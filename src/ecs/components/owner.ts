import type { EntityId } from "bitecs"

export const OwnerComponent = {
  owner: [] as Owner[],
}

export type Owner = {
    owner: EntityId
}
