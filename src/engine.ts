import { Display } from 'rot-js'
import {
  createWorld,
  type World,
  type EntityId,
  query,
  hasComponent,
} from 'bitecs'
import {
  ActionComponent,
  DeadComponent,
  PositionComponent,
  RemoveComponent,
} from './ecs/components'
import {
  type RenderSystem,
  RenderEntitySystem,
  RenderHudSystem,
  RenderMapSystem,
} from './ecs/systems/render-systems'
import {
  type UpdateSystem,
  UpdateActionSystem,
  UpdateWantAttackSystem,
  UpdateRemoveSystem,
  UpdateAiActionSystem,
} from './ecs/systems/update-systems'
import { Map } from './map'
import { DefaultGenerator, type Generator } from './map/generators'
import type { Vector2 } from './types'
import { createPlayer } from './ecs/templates'
import { MessageLog } from './utils/message-log'

export class Engine {
  public static readonly WIDTH = 80
  public static readonly HEIGHT = 50
  public static readonly MAP_WIDTH = 80
  public static readonly MAP_HEIGHT = 45

  display: Display
  world: World
  player: EntityId
  actors: EntityId[]
  currentActor: EntityId
  playerFOV: Vector2[]
  map: Map
  generator: Generator
  log: MessageLog
  renderSystems: RenderSystem[]
  renderHudSystem: RenderHudSystem
  updateSystems: UpdateSystem[]
  playerTurn: boolean

  constructor() {
    this.display = new Display({
      width: Engine.WIDTH,
      height: Engine.HEIGHT,
      forceSquareRatio: true,
    })
    this.world = createWorld()
    this.map = new Map(this.world, Engine.MAP_WIDTH, Engine.MAP_HEIGHT)
    this.playerFOV = []
    this.log = new MessageLog()
    this.log.addMessage('Welcome to your doom, adventurer...')

    this.generator = new DefaultGenerator(this.world, this.map, 10, 5, 12, 10)
    this.generator.generate()
    const startPosition = this.generator.playerStartPosition()

    this.player = createPlayer(this.world, startPosition)
    this.actors = []
    this.actors.push(this.player)

    for (const eid of query(this.world, [PositionComponent])) {
      const position = PositionComponent.position[eid]
      this.map.addEntityAtLocation(eid, { x: position.x, y: position.y })

      if (
        hasComponent(this.world, eid, ActionComponent) &&
        eid !== this.player
      ) {
        this.actors.push(eid)
      }
    }

    this.updateSystems = [
      new UpdateRemoveSystem(),
      new UpdateAiActionSystem(this.map, this.player, this.playerFOV),
      new UpdateActionSystem(
        this.log,
        this.map,
        PositionComponent.position[this.player],
        this.playerFOV,
      ),
      new UpdateWantAttackSystem(this.log),
    ]

    this.renderHudSystem = new RenderHudSystem(
      this.world,
      this.map,
      this.player,
      this.log,
      this.playerFOV,
    )
    this.renderSystems = [
      new RenderMapSystem(this.world, this.map, this.playerFOV),
      new RenderEntitySystem(this.world, this.playerFOV),
      this.renderHudSystem,
    ]

    this.playerTurn = true
    this.currentActor = this.player

    window.addEventListener('keydown', e => this.keyDown(e))
    window.addEventListener('mousemove', e => this.mouseMove(e))
  }

  render() {
    this.display.clear()

    this.renderSystems.forEach((rs) => {
      rs.render(this.display)
    })
  }

  update() {
    do {
      this.updateSystems.forEach((us) => {
        us.update(this.world, this.currentActor)
      })

      this.render()

      this.actors = this.actors.filter(
        (a) =>
          !hasComponent(this.world, a, DeadComponent) ||
          !hasComponent(this.world, a, RemoveComponent),
      )

      this.actors.push(this.actors.shift()!)
      this.currentActor = this.actors[0]
      this.playerTurn = this.currentActor === this.player
    } while (!this.playerTurn)
  }

  keyDown(event: KeyboardEvent) {
    event.preventDefault()
    if(this.playerTurn){
    if (this.renderHudSystem.active) {
      if (this.renderHudSystem.handleKeyboardInput(event)) {
        this.render()
      }
    } else {
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
        case '.':
          this.setPlayerAction(0, 0)
          break
        case 'i':
          this.renderHudSystem.setActive(true)
          this.render()
          break
      }
    }
  }
  }

  mouseMove(event: MouseEvent) {
    if(this.playerTurn){
    if (this.renderHudSystem.active) {
      const mousePosition = this.display.eventToPosition(event)
      const mouseVector = { x: mousePosition[0], y: mousePosition[1] }
      if (this.renderHudSystem.handleMouseInput(event, mouseVector)) {
        this.render()
      }
    }}
  }

  setPlayerAction(xOffset: number, yOffset: number) {
    const action = ActionComponent.action[this.player]
    action.xOffset = xOffset
    action.yOffset = yOffset
    action.processed = false

    this.update()
  }
}
