import { type World } from 'bitecs'
import { Display } from 'rot-js'

export interface RenderSystem {
  render(display: Display, world: World): void
}
