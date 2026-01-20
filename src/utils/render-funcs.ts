import type { Display } from "rot-js";
import type { Vector2 } from "../types";

export const renderHorizontalColoredBar = (
    display: Display,
    position: Vector2,
    width: number,
    color: string
) => {
    for(let i = position.x; i < position.x + width; i++){
        display.draw(i, position.y, ' ', color, color)
    }
}