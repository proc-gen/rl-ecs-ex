import type { EntityId } from 'bitecs'

export const WantCauseSpellEffectComponent = {
  effect: [] as WantCauseSpellEffect[],
}

export type WantCauseSpellEffect = {
  attacker: EntityId
  defender: EntityId
  spell: EntityId
}
