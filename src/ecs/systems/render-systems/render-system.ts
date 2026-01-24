import { type World } from 'bitecs'
import { Display } from 'rot-js'

export interface RenderSystem {
  world: World
  
  render(display: Display): void
}
