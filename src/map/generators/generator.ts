import { OrderedGlyphs, WALL_TILE } from '../../constants/tiles'
import type { Vector2 } from '../../types'
import { Sector } from '../containers'
import { Map } from '../map'

export interface Generator {
  generate(): void
  playerStartPosition(): Vector2
}

export const clearMap = (map: Map) => {
  map.tiles = new Array(map.width)
  for (let x = 0; x < map.width; x++) {
    const col = new Array(map.height)
    for (let y = 0; y < map.height; y++) {
      col[y] = { ...WALL_TILE }
    }
    map.tiles[x] = col
  }
}

export const tunnel = (start: Vector2, end: Vector2): Sector => {
  const sector = new Sector(
    Math.floor((start.x + end.x) / 2),
    Math.floor((start.y + end.y) / 2),
  )

  let curPos = start
  const horizontalDirection = Math.sign(end.x - start.x)
  const verticalDirection = Math.sign(end.y - start.y)

  let digHorizontal = true
  if (Math.abs(end.y - start.y) > Math.abs(end.x - start.x)) {
    digHorizontal = false
  }

  while (curPos.x != end.x || curPos.y != end.y) {
    if (digHorizontal && curPos.x === end.x) {
      digHorizontal = false
    } else if (!digHorizontal && curPos.y === end.y) {
      digHorizontal = true
    }

    if (digHorizontal) {
      curPos.x += horizontalDirection
    } else {
      curPos.y += verticalDirection
    }

    sector.includedTiles.push({ ...curPos })
  }

  return sector
}

export const prettify = (map: Map) => {
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      if (!map.tiles[x][y].walkable) {
        let mask = 0
        mask += map.isWalkable(x, y - 1) ? 0 : 1
        mask += map.isWalkable(x, y + 1) ? 0 : 2
        mask += map.isWalkable(x - 1, y) ? 0 : 4
        mask += map.isWalkable(x + 1, y) ? 0 : 8

        map.tiles[x][y].char = OrderedGlyphs[mask]
      }
    }
  }
}
