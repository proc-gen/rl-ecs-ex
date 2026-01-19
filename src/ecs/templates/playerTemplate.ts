import { addComponents, addEntity, type World } from "bitecs"
import type { Vector2 } from "../../types"
import { ActionComponent, 
            AliveComponent, 
            BlockerComponent, 
            HealthComponent, 
            InfoComponent, 
            PlayerComponent, 
            PositionComponent, 
            RenderableComponent, 
            StatsComponent
        } from "../components"

export const createPlayer = (world: World, startPosition: Vector2) => {
    const player = addEntity(world)

    addComponents(world, player, 
        ActionComponent, 
        BlockerComponent,
        InfoComponent,
        PlayerComponent, 
        PositionComponent, 
        RenderableComponent,
        AliveComponent,
        HealthComponent,
        StatsComponent,
    )
    ActionComponent.action[player] = { processed: true, xOffset: 0, yOffset: 0 }
    InfoComponent.info[player] = { name: "Player" }
    PositionComponent.position[player] = { x: startPosition.x, y: startPosition.y }
    RenderableComponent.renderable[player] = { char: '@', fg: "#ffee00", bg: "#000000" }
    HealthComponent.health[player] = { current: 30, max: 30 }
    StatsComponent.stats[player] = { strength: 5, defense: 2 }
    return player
}