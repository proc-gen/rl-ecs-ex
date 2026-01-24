import { addComponents, addEntity, type World } from 'bitecs'
import type { Vector2 } from '../../types'
import {
  InfoComponent,
  PositionComponent,
  RenderableComponent,
  RenderLayerGroundComponent,
} from '../components'
import { Colors } from '../../constants/colors'

export const createCorpse = (world: World, position: Vector2, name: string) => {
  const corpse = addEntity(world)

  addComponents(
    world,
    corpse,
    InfoComponent,
    PositionComponent,
    RenderableComponent,
    RenderLayerGroundComponent,
  )

  InfoComponent.info[corpse] = { name: `Corpse of ${name}` }
  PositionComponent.position[corpse] = { ...position }
  RenderableComponent.renderable[corpse] = {
    char: '%',
    fg: Colors.LightGrey,
    bg: Colors.DarkRed,
  }

  return corpse
}
