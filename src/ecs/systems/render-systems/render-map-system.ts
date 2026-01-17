import { type World } from "bitecs";
import { type RenderSystem } from "./";
import { Display } from "rot-js";
import { Map } from "../../../map";

export class RenderMapSystem implements RenderSystem {
    map: Map

    constructor(map: Map) {
        this.map = map
    }

    render(display: Display, world: World) {
        for (let x = 0; x < this.map.tiles.length; x++) {
            const col = this.map.tiles[x];
            for (let y = 0; y < col.length; y++) {
                const tile = col[y];
                display.draw(x, y, tile.char, tile.fg, tile.bg);
            }
        }
    }
}