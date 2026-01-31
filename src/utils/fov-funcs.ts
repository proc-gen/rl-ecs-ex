import { type Map } from '../map'
import { type Position } from '../ecs/components'
import { type Vector2 } from '../types'
import { FOV } from 'rot-js'

export const processFOV = (map: Map, position: Position, range: number) => {
  const fovPositions: Vector2[] = []
  const fov = new FOV.PreciseShadowcasting(map.lightPassesThrough.bind(map))
  fov.compute(position.x, position.y, range, (x, y, _r, visibility) => {
    if (visibility === 1) {
      fovPositions.push({ x, y })
    }
  })

  return fovPositions
}

export const processPlayerFOV = (
  map: Map,
  position: Position,
  playerFOV: Vector2[],
) => {
  playerFOV.length = 0
  const fovPositions = processFOV(map, position, 8)
  fovPositions.forEach((p) => {
    map.tiles[p.x][p.y].seen = true
    playerFOV.push({ ...p })
  })
}
