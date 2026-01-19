import { query, removeEntity, type EntityId, type World } from "bitecs";
import type { UpdateSystem } from "./update-system";
import { RemoveComponent } from "../../components";

export class UpdateRemoveSystem implements UpdateSystem {
    update(world: World, _entity: EntityId){
        for(const eid of query(world, [RemoveComponent])) {
            removeEntity(world, eid)
        }
    }
}