import {
  addComponent,
  hasComponent,
  query,
  type EntityId,
  type World,
} from 'bitecs'
import type { MessageLog } from '../../../utils/message-log'
import type { UpdateSystem } from './update-system'
import {
  ConfusionComponent,
  DeadComponent,
  InfoComponent,
  RemoveComponent,
  SpellComponent,
  WantCauseSpellEffectComponent,
  type Info,
  type WantCauseSpellEffect,
} from '../../components'

export class UpdateWantCauseSpellEffectSystem implements UpdateSystem {
  log: MessageLog

  constructor(log: MessageLog) {
    this.log = log
  }

  update(world: World, _entity: EntityId) {
    for (const eid of query(world, [WantCauseSpellEffectComponent])) {
      const effect = WantCauseSpellEffectComponent.effect[eid]
      if (!hasComponent(world, effect.defender, DeadComponent)) {
        const spell = SpellComponent.spell[effect.spell]
        const infoBlocker = InfoComponent.info[effect.defender]

        if (spell.spellName === 'Confusion') {
          this.processConfusion(world, effect, infoBlocker)
        }
      }
      addComponent(world, eid, RemoveComponent)
    }
  }

  processConfusion(
    world: World,
    effect: WantCauseSpellEffect,
    infoBlocker: Info,
  ) {
    const confusion = ConfusionComponent.confusion[effect.spell]
    if (hasComponent(world, effect.defender, ConfusionComponent)) {
      const defenderConfused = ConfusionComponent.confusion[effect.defender]
      defenderConfused.turnsLeft = confusion.turnsLeft

      this.log.addMessage(
        `The ${infoBlocker.name} continues to stumble around in confusion`,
      )
    } else {
      addComponent(world, effect.defender, ConfusionComponent)
      ConfusionComponent.confusion[effect.defender] = { ...confusion }

      this.log.addMessage(
        `The eyes of the ${infoBlocker.name} look vacant as it begins to stumble around`,
      )
    }
  }
}
