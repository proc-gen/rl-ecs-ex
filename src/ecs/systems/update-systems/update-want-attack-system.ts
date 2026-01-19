import { query, removeEntity, type World } from "bitecs";
import type { UpdateSystem } from "./update-system";
import { InfoComponent, WantMeleeAttackComponent } from "../../components";

export class UpdateWantAttackSystem implements UpdateSystem {

    update(world: World){
        for (const eid of query(world, [WantMeleeAttackComponent])) {
            const attack = WantMeleeAttackComponent.wantMeleeAttack[eid]
            const infoActor = InfoComponent.info[attack.attacker]
            const infoBlocker = InfoComponent.info[attack.defender]

            console.log(`${infoActor.name} kicks ${infoBlocker.name} in the shin. It was ineffective.`)
        
            removeEntity(world, eid)
        }
    }
}