import { type Tile } from '../map'

export const FLOOR_TILE: Tile = {
  walkable: true,
  transparent: true,
  char: '.',
  fg: '#ffffff',
  bg: '#000000',
  seen: false,
}

export const WALL_TILE: Tile = {
  walkable: false,
  transparent: false,
  char: '#',
  fg: '#ffffff',
  bg: '#000000',
  seen: false,
}
