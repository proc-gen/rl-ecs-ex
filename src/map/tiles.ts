import { type Tile } from "./tile";

export const FLOOR_TILE: Tile = {
  walkable: true,
  transparent: true,
  char: '.', 
  fg: '#fff', 
  bg: '#000'
}

export const WALL_TILE: Tile = {
  walkable: false,
  transparent: false,
  char: '#',
  fg: '#fff', 
  bg: '#000'
}