import { type Tile } from '../map'
import { Colors } from './colors'

export const FLOOR_TILE: Tile = {
  walkable: true,
  transparent: true,
  char: '.',
  fg: Colors.White,
  bg: Colors.Black,
  seen: false,
  name: 'Floor',
}

export const STAIRS_DOWN_TILE: Tile = {
  walkable: true,
  transparent: true,
  char: '▼',
  fg: Colors.Stairs,
  bg: Colors.Black,
  seen: false,
  name: 'Stairs Down',
}

export const WALL_TILE: Tile = {
  walkable: false,
  transparent: false,
  char: '#',
  fg: Colors.White,
  bg: Colors.Black,
  seen: false,
  name: 'Wall',
}
