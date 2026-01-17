import { query, type World } from "bitecs";
import { type UpdateSystem } from "./";
import { ActionComponent, type Action, PositionComponent } from "../../components";
import { Map } from "../../../map";

export class UpdateActionSystem implements UpdateSystem {
    map: Map

    constructor(map: Map) {
        this.map = map
    }

    update(world: World) {
        for (const eid of query(world, [ActionComponent, PositionComponent])) {
            const position = PositionComponent.position[eid]
            const action = ActionComponent.action[eid]

            if (!action.processed) {
                if (this.map.isWalkable(position.x + action.xOffset, position.y + action.yOffset)) {
                    position.x += action.xOffset
                    position.y += action.yOffset
                }
                this.resetAction(action)
            }
        }
    }

    resetAction(action: Action) {
        action.processed = true
        action.xOffset = 0
        action.yOffset = 0
    }
}