import {
  addComponent,
  addComponents,
  hasComponent,
  query,
  removeComponent,
  type EntityId,
  type World,
} from 'bitecs'
import type { UpdateSystem } from './update-system'
import {
  AliveComponent,
  DeadComponent,
  HealthComponent,
  InfoComponent,
  PlayerComponent,
  RemoveComponent,
  SpellComponent,
  StatsComponent,
  WantAttackComponent,
  type Info,
  type Stats,
  type WantAttack,
} from '../../components'
import { MessageLog } from '../../../utils/message-log'
import { AttackType } from '../../../constants/attack-type'

export class UpdateWantAttackSystem implements UpdateSystem {
  log: MessageLog

  constructor(log: MessageLog) {
    this.log = log
  }

  update(world: World, _entity: EntityId) {
    for (const eid of query(world, [WantAttackComponent])) {
      const attack = WantAttackComponent.WantAttack[eid]
      const infoActor = InfoComponent.info[attack.attacker]
      const statsAttacker = StatsComponent.stats[attack.attacker]
      const infoBlocker = InfoComponent.info[attack.defender]
      const statsBlocker = StatsComponent.stats[attack.defender]
      const healthBlocker = HealthComponent.health[attack.defender]

      let processedAttack = { damage: 0, message: '' }
      if (attack.attackType === AttackType.Melee) {
        processedAttack = this.processMeleeAttack(
          statsAttacker,
          statsBlocker,
          infoActor,
          infoBlocker,
        )
      } else if (attack.attackType === AttackType.Spell) {
        processedAttack = this.processSpellAttack(
          attack,
          statsAttacker,
          statsBlocker,
          infoActor,
          infoBlocker,
        )
      }

      this.log.addMessage(processedAttack.message)
      if (processedAttack.damage > 0) {
        healthBlocker.current = Math.max(
          0,
          healthBlocker.current - processedAttack.damage,
        )

        if (healthBlocker.current === 0) {
          this.log.addMessage(`${infoBlocker.name} has died.`)
          if (hasComponent(world, attack.defender, PlayerComponent)) {
            addComponent(world, attack.defender, DeadComponent)
          } else {
            const gainedXp = StatsComponent.stats[attack.defender].xpGiven
            PlayerComponent.player[attack.attacker].currentXp += gainedXp
            this.log.addMessage(`You gain ${gainedXp} experience points`)

            addComponents(
              world,
              attack.defender,
              RemoveComponent,
              DeadComponent,
            )
          }

          removeComponent(world, attack.defender, AliveComponent)
        }
      }

      addComponent(world, eid, RemoveComponent)
    }
  }

  processMeleeAttack(
    statsAttacker: Stats,
    statsBlocker: Stats,
    infoActor: Info,
    infoBlocker: Info,
  ) {
    const damage = statsAttacker.strength - statsBlocker.defense
    const attackDescription = `${infoActor.name} attacks ${infoBlocker.name}`
    let message = ''
    if (damage > 0) {
      message = `${attackDescription} for ${damage} health.`
    } else {
      message = `${attackDescription} but can't seem to leave a mark.`
    }

    return { damage, message }
  }

  processSpellAttack(
    attack: WantAttack,
    statsAttacker: Stats,
    statsBlocker: Stats,
    infoActor: Info,
    infoBlocker: Info,
  ) {
    const spell = SpellComponent.spell[attack.spell!]
    const damage = spell.damage
    let message = ''

    switch (spell.spellName) {
      case 'Lightning':
        message = `A lightning bolt strikes the ${infoBlocker.name} with loud thunder, for ${damage} damage!`
        break
      case 'Fireball':
        message = `The ${infoBlocker.name} is engulfed in a fiery explosion, taking ${damage} damage!`
        break
    }

    return { damage, message }
  }
}
