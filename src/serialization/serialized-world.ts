import type { EntityId } from "bitecs"
import type { Tile } from "../map"

export type SerializedWorld = {
    width: number
    height: number
    tiles: Tile[][]
    serializedEntities: SerializedEntity[]
}

export type SerializedEntity = {
    savedId: EntityId
    loadedId?: EntityId
    components: SerializedComponent[]
}

export type SerializedComponent = {
    componentType: string
    data: any
}