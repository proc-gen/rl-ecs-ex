import { query, type World } from "bitecs";
import { type RenderSystem } from "./";
import { PositionComponent, RenderableComponent } from "../../components";
import { Display } from "rot-js";

export class RenderEntitySystem implements RenderSystem {
    render(display: Display, world: World) {
        for (const eid of query(world, [PositionComponent, RenderableComponent])) {
            const position = PositionComponent.position[eid]
            const renderable = RenderableComponent.renderable[eid]

            display.draw(position.x, position.y, renderable.char, renderable.fg, renderable.bg)
	    }
    }
}