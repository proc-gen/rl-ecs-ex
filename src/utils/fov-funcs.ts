import { type Map } from '../map'
import { type Position } from '../ecs/components'
import { type Vector2 } from '../types'
import { Color, FOV } from 'rot-js'

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
  const fovPositions = processFOV(map, position, 99)
  fovPositions.forEach((p) => {
    const rgb = Color.fromString(map.tiles[p.x][p.y].lighting)
    const lightLevel = (rgb[0] + rgb[1] + rgb[2]) / 3.0
    if (lightLevel > 0.33) {
      map.tiles[p.x][p.y].seen = true
    }
    playerFOV.push({ ...p })
  })
}
