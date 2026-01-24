import type { Vector2 } from "../types"

export interface InputController {
    active: boolean
    
    setActive(value: boolean): void
    getActive(): boolean

    handleKeyboardInput(event: KeyboardEvent): boolean
    handleMouseInput(event: MouseEvent, position: Vector2): boolean
}