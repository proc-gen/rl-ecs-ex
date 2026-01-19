import { Display } from 'rot-js'
import { createWorld, type World, type EntityId, query, hasComponent } from 'bitecs'
import { ActionComponent, PositionComponent } from './ecs/components'
import { type RenderSystem, RenderEntitySystem, RenderMapSystem } from './ecs/systems/render-systems'
import { type UpdateSystem, UpdateActionSystem, UpdateWantAttackSystem, UpdateRemoveSystem } from './ecs/systems/update-systems'
import { Map } from './map'
import { DefaultGenerator, type Generator } from './map/generators'
import type { Vector2 } from './types'
import { createPlayer } from './ecs/templates'

export class Engine {
  public static readonly WIDTH = 80
  public static readonly HEIGHT = 50
  public static readonly MAP_WIDTH = 80;
  public static readonly MAP_HEIGHT = 50;

  display: Display
  world: World
  player: EntityId
  actors: EntityId[]
  playerFOV: Vector2[]
  map: Map
  generator: Generator
  renderSystems: RenderSystem[]
  updateSystems: UpdateSystem[]

  constructor() {
    this.display = new Display({ width: Engine.WIDTH, height: Engine.HEIGHT, forceSquareRatio: true })
    this.world = createWorld()
    this.map = new Map(
      Engine.MAP_WIDTH,
      Engine.MAP_HEIGHT,
    )
    this.playerFOV = []
    this.actors = []

    this.generator = new DefaultGenerator(this.world, this.map, 10, 5, 12, 10)
    this.generator.generate()
    const startPosition = this.generator.playerStartPosition()

    this.player = createPlayer(this.world, startPosition)
    
    for (const eid of query(this.world, [PositionComponent])) {
      const position = PositionComponent.position[eid]
      this.map.addEntityAtLocation(eid, {x: position.x, y: position.y})

      if(hasComponent(this.world, eid, ActionComponent)){
        this.actors.push(eid)
      }
    }

    this.renderSystems = [
      new RenderMapSystem(this.map, this.playerFOV), 
      new RenderEntitySystem(this.playerFOV)
    ]
    this.updateSystems = [
      new UpdateRemoveSystem(),
      new UpdateActionSystem(this.map, PositionComponent.position[this.player], this.playerFOV),
      new UpdateWantAttackSystem(),
    ]

    window.addEventListener('keydown', (event) => {
      this.keyDown(event)
    })
  }

  render() {
    this.display.clear();

    this.renderSystems.forEach(rs => {
      rs.render(this.display, this.world)
    });
  }

  update() {
    this.updateSystems.forEach(us => {
      us.update(this.world)
    })

    this.render()
  }

  keyDown(event: KeyboardEvent) {
    event.preventDefault()
    switch (event.key) {
      case 'ArrowUp':
        this.setPlayerAction(0, -1)
        break
      case 'ArrowDown':
        this.setPlayerAction(0, 1)
        break
      case 'ArrowLeft':
        this.setPlayerAction(-1, 0)
        break
      case 'ArrowRight':
        this.setPlayerAction(1, 0)
        break
    }
  }

  setPlayerAction(xOffset: number, yOffset: number) {
    const action = ActionComponent.action[this.player]
    action.xOffset = xOffset
    action.yOffset = yOffset
    action.processed = false

    this.update()
  }


}