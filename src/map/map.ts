import type { EntityId } from "bitecs"
import type { Vector2 } from "../types"
import { type Tile } from "./tile"

export class Map {
    width: number
    height: number

    tiles: Tile[][]
    private entityLocations:
        {
            position: Vector2
            entities: EntityId[]
        }[]

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.entityLocations = []

        this.tiles = new Array(this.width)
        for (let x = 0; x < this.width; x++) {
            const col = new Array(this.height)
            this.tiles[x] = col
        }
    }

    isInBounds(x: number, y: number) {
        return 0 <= x && x < this.width && 0 <= y && y < this.height
    }

    isWalkable(x: number, y: number) {
        return this.isInBounds(x, y) && this.tiles[x][y].walkable
    }

    lightPassesThrough(x: number, y: number) {
        if (this.isInBounds(x, y)) {
            return this.tiles[x][y].transparent
        }

        return false
    }

    addEntityAtLocation(entity: EntityId, position: Vector2){
        let entityLocation = this.entityLocations.find(a => a.position.x === position.x && a.position.y === position.y)
        if(entityLocation === undefined){
            entityLocation = {
                position,
                entities: []
            }
            this.entityLocations.push(entityLocation)
        }

        entityLocation.entities.push(entity)
    }

    removeEntityAtLocation(entity: EntityId, position: Vector2){
        let entityLocation = this.entityLocations.find(a => a.position.x === position.x && a.position.y === position.y)
        if(entityLocation !== undefined){
            entityLocation.entities = entityLocation.entities.filter(a => a !== entity)
            
            if(entityLocation.entities.length === 0){
                this.entityLocations = 
                    this.entityLocations.filter(a => 
                        a.position.x !== position.x || a.position.y !== position.y
                    )
            }
        }
    }

    moveEntity(entity: EntityId, oldPosition: Vector2, newPosition: Vector2){
        this.removeEntityAtLocation(entity, oldPosition)
        this.addEntityAtLocation(entity, newPosition)
    }

    getEntitiesAtLocation(position: Vector2){
        let entityLocation = this.entityLocations.find(a => a.position.x === position.x && a.position.y === position.y)
        if(entityLocation !== undefined){
            return entityLocation.entities
        }

        return []
    }
}