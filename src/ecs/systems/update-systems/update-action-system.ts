import { hasComponent, query, type World } from "bitecs";
import { type UpdateSystem } from "./";
import { ActionComponent, type Action, PositionComponent, PlayerComponent, type Position } from "../../components";
import { Map } from "../../../map";
import type { Vector2 } from "../../../types";
import { FOV } from "rot-js";

export class UpdateActionSystem implements UpdateSystem {
    map: Map
    playerFOV: Vector2[]

    constructor(map: Map, playerPosition: Position, playerFOV: Vector2[]) {
        this.map = map
        this.playerFOV = playerFOV
        this.processPlayerFOV(playerPosition)
    }

    update(world: World) {
        for (const eid of query(world, [ActionComponent, PositionComponent])) {
            const position = PositionComponent.position[eid]
            const action = ActionComponent.action[eid]

            if (!action.processed) {
                if (this.map.isWalkable(position.x + action.xOffset, position.y + action.yOffset)) {
                    position.x += action.xOffset
                    position.y += action.yOffset

                    if(hasComponent(world, eid, PlayerComponent)){
                        this.processPlayerFOV(position)
                    }
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

    processPlayerFOV(position: Position){
        this.playerFOV.length = 0

        const fov = new FOV.PreciseShadowcasting(this.map.lightPassesThrough.bind(this.map))
        fov.compute(position.x, position.y, 8, (x, y, _r, visibility) => {
            if(visibility === 1){
                this.map.tiles[x][y].seen = true

                this.playerFOV.push({x, y})
            }
        })
    }
}