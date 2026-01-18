import { addComponents, addEntity, type World } from "bitecs"
import type { Vector2 } from "../../types"
import { ActionComponent, 
            BlockerComponent, 
            InfoComponent, 
            EnemyComponent, 
            PositionComponent, 
            RenderableComponent 
        } from "../components"

export const createEnemy = (world: World, startPosition: Vector2, name: string) => {
    const enemyStats = enemyStatLookup(name)
    if(enemyStats === undefined){
        return
    }

    const enemy = addEntity(world)

    addComponents(world, enemy, 
        ActionComponent, 
        BlockerComponent,
        InfoComponent,
        EnemyComponent, 
        PositionComponent, 
        RenderableComponent)
    ActionComponent.action[enemy] = { processed: true, xOffset: 0, yOffset: 0 }
    InfoComponent.info[enemy] = { name }
    PositionComponent.position[enemy] = { x: startPosition.x, y: startPosition.y }
    RenderableComponent.renderable[enemy] = { char: enemyStats.char, fg: enemyStats.fg, bg: enemyStats.bg }

    return enemy
}

const enemyStatLookup = (name: string) => {
    if(name === "Orc"){
        return {
            char: 'o',
            fg: "#7f3f3f",
            bg: "#000000",
        }
    }
    else if(name === "Troll"){
        return {
            char: 't',
            fg: "#7f0000",
            bg: "#000000",
        }
    }

    return undefined
}