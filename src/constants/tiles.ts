import { type Tile } from '../map'
import { Colors } from './colors'

export const FLOOR_TILE: Tile = {
  walkable: true,
  transparent: true,
  char: '.',
  fg: Colors.White,
  bg: Colors.Black,
  seen: false,
}

export const WALL_TILE: Tile = {
  walkable: false,
  transparent: false,
  char: '#',
  fg: Colors.White,
  bg: Colors.Black,
  seen: false,
}
