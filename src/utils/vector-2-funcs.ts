import type { Vector2 } from "../types";

export const add = (v1: Vector2, v2: Vector2) => {
    return {x: v1.x + v2.x, y: v1.y + v2.y}
}

export const distance = (v1: Vector2, v2: Vector2) => {
    return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2)
}