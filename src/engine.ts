import { Display } from 'rot-js'
import { createWorld, addEntity, type World, type EntityId, addComponents } from 'bitecs'
import { ActionComponent, PlayerComponent, PositionComponent, RenderableComponent } from './ecs/components'
import { type RenderSystem, RenderEntitySystem, RenderMapSystem } from './ecs/systems/render-systems'
import { type UpdateSystem, UpdateActionSystem } from './ecs/systems/update-systems'
import { Map } from './map'
import { DefaultGenerator, type Generator } from './map/generators'
import type { Vector2 } from './types'

export class Engine {
  public static readonly WIDTH = 80
  public static readonly HEIGHT = 50
  public static readonly MAP_WIDTH = 80;
  public static readonly MAP_HEIGHT = 50;

  display: Display
  world: World
  player: EntityId
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
    
    this.generator = new DefaultGenerator(this.map, 10, 5, 12)
    this.generator.generate()
    const startPosition = this.generator.playerStartPosition()

    this.player = addEntity(this.world)
    addComponents(this.world, this.player, ActionComponent, PlayerComponent, PositionComponent, RenderableComponent)
    ActionComponent.action[this.player] = { processed: true, xOffset: 0, yOffset: 0 }
    PositionComponent.position[this.player] = { x: startPosition.x, y: startPosition.y }
    RenderableComponent.renderable[this.player] = { char: '@', fg: "#ffffff", bg: "#000000" }

    this.renderSystems = [new RenderMapSystem(this.map, this.playerFOV), new RenderEntitySystem(this.playerFOV)]
    this.updateSystems = [new UpdateActionSystem(this.map, PositionComponent.position[this.player], this.playerFOV)]

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