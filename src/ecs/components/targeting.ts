import type { Vector2 } from '../../types'
import type { Component } from './component'

export const TargetingComponent: Component<Targeting> = {
  values: [] as Targeting[],
}

export type Targeting = {
  position: Vector2
  targetingType: string
}
