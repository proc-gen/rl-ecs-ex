import { type Tile } from "./tile"
import { FLOOR_TILE, WALL_TILE } from "./tiles"

export class Map {
    width: number
    height: number

    tiles: Tile[][]

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        const xMax = this.width - 1
        const yMax = this.height - 1

        this.tiles = new Array(this.width)
        for (let x = 0; x < this.width; x++) {
            const col = new Array(this.height)
            for (let y = 0; y < this.height; y++) {
                if((x % xMax === 0) ||
                    (y % yMax === 0) || 
                    (x % Math.round(xMax / 3) < 2 && y % Math.round(yMax / 3) < 2 )) {
                    col[y] = { ...WALL_TILE }
                } else {
                    col[y] = { ...FLOOR_TILE }
                }
            }
            this.tiles[x] = col
        }
    }

    isInBounds(x: number, y: number) {
        return 0 <= x && x < this.width && 0 <= y && y < this.height
    }

    isWalkable(x: number, y: number) {
        return this.isInBounds(x, y) && this.tiles[x][y].walkable
    }
}