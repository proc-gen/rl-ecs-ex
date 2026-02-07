import type { EntityId } from "bitecs"

export const EquipmentComponent = {
  equipment: [] as Equipment[],
}

export type Equipment = {
    armor: EntityId
    weapon: EntityId
}
