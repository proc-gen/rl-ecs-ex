import { query, removeEntity, type World } from "bitecs";
import type { UpdateSystem } from "./update-system";
import { RemoveComponent } from "../../components";

export class UpdateRemoveSystem implements UpdateSystem {
    update(world: World){
        for(const eid of query(world, [RemoveComponent])) {
            removeEntity(world, eid)
        }
    }
}