import { hasComponent, type EntityId, type World } from 'bitecs'
import type { Vector2 } from '../types'
import { type Tile } from './tile'
import AStar from 'rot-js/lib/path/astar'
import { BlockerComponent, PlayerComponent } from '../ecs/components'

export class Map {
  width: number
  height: number
  world: World
  pathStart: Vector2
  tiles: Tile[][]
  private entityLocations: {
    position: Vector2
    entities: EntityId[]
  }[]

  constructor(world: World, width: number, height: number) {
    this.width = width
    this.height = height
    this.world = world
    this.entityLocations = []
    this.pathStart = { x: 0, y: 0 }
    this.tiles = new Array(this.width)
    for (let x = 0; x < this.width; x++) {
      const col = new Array(this.height)
      this.tiles[x] = col
    }
  }

  isInBounds(x: number, y: number) {
    return 0 <= x && x < this.width && 0 <= y && y < this.height
  }

  isWalkable(x: number, y: number) {
    return this.isInBounds(x, y) && this.tiles[x][y].walkable
  }

  lightPassesThrough(x: number, y: number) {
    if (this.isInBounds(x, y)) {
      return this.tiles[x][y].transparent
    }

    return false
  }

  addEntityAtLocation(entity: EntityId, position: Vector2) {
    let entityLocation = this.entityLocations.find(
      (a) => a.position.x === position.x && a.position.y === position.y,
    )
    if (entityLocation === undefined) {
      entityLocation = {
        position,
        entities: [],
      }
      this.entityLocations.push(entityLocation)
    }

    entityLocation.entities.push(entity)
  }

  removeEntityAtLocation(entity: EntityId, position: Vector2) {
    let entityLocation = this.entityLocations.find(
      (a) => a.position.x === position.x && a.position.y === position.y,
    )
    if (entityLocation !== undefined) {
      entityLocation.entities = entityLocation.entities.filter(
        (a) => a !== entity,
      )

      if (entityLocation.entities.length === 0) {
        this.entityLocations = this.entityLocations.filter(
          (a) => a.position.x !== position.x || a.position.y !== position.y,
        )
      }
    }
  }

  moveEntity(entity: EntityId, oldPosition: Vector2, newPosition: Vector2) {
    this.removeEntityAtLocation(entity, oldPosition)
    this.addEntityAtLocation(entity, newPosition)
  }

  getEntitiesAtLocation(position: Vector2) {
    let entityLocation = this.entityLocations.find(
      (a) => a.position.x === position.x && a.position.y === position.y,
    )
    if (entityLocation !== undefined) {
      return entityLocation.entities
    }

    return []
  }

  getPath(start: Vector2, end: Vector2) {
    const astar = new AStar(end.x, end.y, this.passableCallBack.bind(this), {
      topology: 4,
    })
    const path: Vector2[] = []
    this.pathStart = start
    astar.compute(start.x, start.y, (x: number, y: number) => {
      if (x !== this.pathStart.x || y !== this.pathStart.y) {
        path.push({ x, y })
      }
    })

    return path
  }

  passableCallBack(x: number, y: number) {
    if (x === this.pathStart.x && y === this.pathStart.y) {
      return true
    }

    if (this.isWalkable(x, y)) {
      const entities = this.getEntitiesAtLocation({ x, y })
      if (
        entities.length === 0 ||
        entities.find((a) => hasComponent(this.world, a, BlockerComponent)) ===
          undefined
      ) {
        return true
      } else if (
        entities.find(
          (a) =>
            hasComponent(this.world, a, BlockerComponent) &&
            hasComponent(this.world, a, PlayerComponent),
        )
      ) {
        return true
      }
    }

    return false
  }
}
