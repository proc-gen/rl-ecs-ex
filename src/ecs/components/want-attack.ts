import type { EntityId } from 'bitecs'

export const WantAttackComponent = {
  WantAttack: [] as WantAttack[],
}

export type WantAttack = {
  attackType: string
  attacker: EntityId
  defender: EntityId
  spell?: EntityId
}
