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
  WantMeleeAttackComponent,
} from '../../components'
import type { MessageLog } from '../../../utils/message-log'

export class UpdateWantAttackSystem implements UpdateSystem {
  log: MessageLog

  constructor(log: MessageLog) {
    this.log = log
  }

  update(world: World, _entity: EntityId) {
    for (const eid of query(world, [WantMeleeAttackComponent])) {
      const attack = WantMeleeAttackComponent.wantMeleeAttack[eid]
      const infoActor = InfoComponent.info[attack.attacker]
      const statsAttacker = StatsComponent.stats[attack.attacker]
      const infoBlocker = InfoComponent.info[attack.defender]
      const statsBlocker = StatsComponent.stats[attack.defender]
      const healthBlocker = HealthComponent.health[attack.defender]

      const damage = statsAttacker.strength - statsBlocker.defense
      const attackDescription = `${infoActor.name} attacks ${infoBlocker.name}`

      if (damage > 0) {
        this.log.addMessage(`${attackDescription} for ${damage} health.`)
        healthBlocker.current = Math.max(0, healthBlocker.current - damage)

        if (healthBlocker.current === 0) {
          this.log.addMessage(`${infoBlocker.name} has died.`)
          addComponents(world, attack.defender, RemoveComponent, DeadComponent)
          removeComponent(world, attack.defender, AliveComponent)
        }
      } else {
        this.log.addMessage(
          `${attackDescription} but can't seem to leave a mark.`,
        )
      }

      addComponent(world, eid, RemoveComponent)
    }
  }
}
