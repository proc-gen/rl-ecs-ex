import { WALL_TILE } from "../../constants/tiles"
import type { Vector2 } from "../../types"
import { Map } from "../map"

export interface Generator {
    generate(): void
    playerStartPosition(): Vector2
}

export const clearMap = (map: Map) => {
    map.tiles = new Array(map.width)
    for (let x = 0; x < map.width; x++) {
        const col = new Array(map.height)
        for (let y = 0; y < map.height; y++) {
            col[y] = { ...WALL_TILE }
        }
        map.tiles[x] = col
    }
}