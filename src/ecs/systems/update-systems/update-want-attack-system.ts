import {
  addComponent,
  addComponents,
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
  RemoveComponent,
  StatsComponent,
  WantAttackComponent,
  type Info,
  type Stats,
} from '../../components'
import type { MessageLog } from '../../../utils/message-log'
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

      let processedAttack = { damage: 0, attackDescription: '' }
      if (attack.attackType === AttackType.Melee) {
        processedAttack = this.processMeleeAttack(
          statsAttacker,
          statsBlocker,
          infoActor,
          infoBlocker,
        )
      }

      if (processedAttack.damage > 0) {
        this.log.addMessage(
          `${processedAttack.attackDescription} for ${processedAttack.damage} health.`,
        )
        healthBlocker.current = Math.max(
          0,
          healthBlocker.current - processedAttack.damage,
        )

        if (healthBlocker.current === 0) {
          this.log.addMessage(`${infoBlocker.name} has died.`)
          addComponents(world, attack.defender, RemoveComponent, DeadComponent)
          removeComponent(world, attack.defender, AliveComponent)
        }
      } else {
        this.log.addMessage(
          `${processedAttack.attackDescription} but can't seem to leave a mark.`,
        )
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

    return { damage, attackDescription }
  }
}
