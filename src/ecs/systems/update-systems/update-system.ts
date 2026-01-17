import { type World } from "bitecs";

export interface UpdateSystem {
    update(world: World): void
}