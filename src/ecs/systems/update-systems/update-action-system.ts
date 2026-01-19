import { addComponent, addEntity, hasComponent, type EntityId, type World } from "bitecs";
import { type UpdateSystem } from "./";
import { ActionComponent, type Action, PositionComponent, PlayerComponent, type Position, BlockerComponent, WantMeleeAttackComponent } from "../../components";
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

    update(world: World, entity: EntityId) {
        const position = PositionComponent.position[entity]
        const action = ActionComponent.action[entity]

        if (!action.processed) {
            const newPosition = {x: position.x + action.xOffset, y: position.y + action.yOffset}
            if (this.map.isWalkable(newPosition.x, newPosition.y)) {
                const entities = this.map.getEntitiesAtLocation(newPosition)

                if(entities.length === 0 || entities.find(a => hasComponent(world, a, BlockerComponent)) === undefined)
                {
                    this.handleMove(world, entity, position, newPosition)     
                }
                else if(entities.length > 0){
                    const blocker = entities.find(a => hasComponent(world, a, BlockerComponent))
                    if(blocker !== undefined){
                        const attack = addEntity(world)
                        addComponent(world, attack, WantMeleeAttackComponent)

                        WantMeleeAttackComponent.wantMeleeAttack[attack] = 
                            {
                                attacker: entity, 
                                defender: blocker
                            }
                    }
                }
            }
            this.resetAction(action)
        }
    }

    handleMove(world: World, eid: EntityId, position: Position, newPosition: Vector2){
        this.map.moveEntity(eid, position, newPosition)
        position.x = newPosition.x
        position.y = newPosition.y

        if(hasComponent(world, eid, PlayerComponent)){
            this.processPlayerFOV(position)
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