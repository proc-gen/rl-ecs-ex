import type { Display } from "rot-js";

export interface RenderWindow {
    render(display: Display): void
}