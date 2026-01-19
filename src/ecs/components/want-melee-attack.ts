import type { EntityId } from 'bitecs'

export const WantMeleeAttackComponent = {
  wantMeleeAttack: [] as WantMeleeAttack[],
}

export type WantMeleeAttack = {
  attacker: EntityId
  defender: EntityId
}
