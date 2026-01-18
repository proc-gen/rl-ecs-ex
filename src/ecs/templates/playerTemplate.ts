import { addComponents, addEntity, type World } from "bitecs"
import type { Vector2 } from "../../types"
import { ActionComponent, 
            BlockerComponent, 
            InfoComponent, 
            PlayerComponent, 
            PositionComponent, 
            RenderableComponent 
        } from "../components"

export const createPlayer = (world: World, startPosition: Vector2) => {
    const player = addEntity(world)

    addComponents(world, player, 
        ActionComponent, 
        BlockerComponent,
        InfoComponent,
        PlayerComponent, 
        PositionComponent, 
        RenderableComponent)
    ActionComponent.action[player] = { processed: true, xOffset: 0, yOffset: 0 }
    InfoComponent.info[player] = { name: "Player" }
    PositionComponent.position[player] = { x: startPosition.x, y: startPosition.y }
    RenderableComponent.renderable[player] = { char: '@', fg: "#ffffff", bg: "#000000" }

    return player
}