import type { EntityId } from 'bitecs'
import type { Component } from './component'

export const WantAttackComponent: Component<WantAttack> = {
  values: [] as WantAttack[],
}

export type WantAttack = {
  attackType: string
  attacker: EntityId
  defender: EntityId
  spell?: EntityId
}
