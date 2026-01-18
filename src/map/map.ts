import { type Tile } from "./tile"

export class Map {
    width: number
    height: number

    tiles: Tile[][]

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

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

    lightPassesThrough(x: number, y: number){
        if(this.isInBounds(x, y)){
            return this.tiles[x][y].transparent
        }

        return false
    }
}