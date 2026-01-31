import type { Vector2 } from "../../types"

export const TargetingComponent = {
    targeting: [] as Targeting[]
}

export type Targeting = {
    position: Vector2
    targetingType: string
}