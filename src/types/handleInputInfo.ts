import type { EntityId } from "bitecs"

export type HandleInputInfo = {
    needUpdate: boolean
    needRender: boolean
    needTargeting?: EntityId
}