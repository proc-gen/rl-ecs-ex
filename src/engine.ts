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
  UpdateWantUseItemSystem,
} from './ecs/systems/update-systems'
import { Map } from './map'
import { DefaultGenerator, type Generator } from './map/generators'
import type { Vector2 } from './types'
import { createPlayer } from './ecs/templates'
import { MessageLog } from './utils/message-log'
import { MessageHistoryWindow } from './windows'

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
  historyViewer: MessageHistoryWindow
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
    this.historyViewer = new MessageHistoryWindow(this.log)

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
      new UpdateRemoveSystem(this.map),
      new UpdateAiActionSystem(this.map, this.player, this.playerFOV),
      new UpdateActionSystem(
        this.log,
        this.map,
        PositionComponent.position[this.player],
        this.playerFOV,
      ),
      new UpdateWantAttackSystem(this.log),
      new UpdateWantUseItemSystem(this.log),
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

    window.addEventListener('keydown', (e) => this.keyDown(e))
    window.addEventListener('mousemove', (e) => this.mouseMove(e))
    window.addEventListener('wheel', (e) => this.mouseMove(e))
  }

  render() {
    this.display.clear()

    this.renderSystems.forEach((rs) => {
      rs.render(this.display)
    })

    if (this.historyViewer.active) {
      this.historyViewer.render(this.display)
    }
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

      const action = ActionComponent.action[this.currentActor]

      if (action.actionSuccessful) {
        this.actors.push(this.actors.shift()!)
        this.currentActor = this.actors[0]
      }
      this.playerTurn = this.currentActor === this.player
    } while (!this.playerTurn)
  }

  keyDown(event: KeyboardEvent) {
    event.preventDefault()
    if (this.playerTurn) {
      if (this.renderHudSystem.active) {
        if (this.renderHudSystem.handleKeyboardInput(event)) {
          this.render()
        }
      } else if (this.historyViewer.active) {
        if (this.historyViewer.handleKeyboardInput(event)) {
          this.render()
        }
      } else {
        switch (event.key) {
          case 'ArrowUp':
          case 'w':
            this.setPlayerAction(0, -1)
            break
          case 'ArrowDown':
          case 's':
            this.setPlayerAction(0, 1)
            break
          case 'ArrowLeft':
          case 'a':
            this.setPlayerAction(-1, 0)
            break
          case 'ArrowRight':
          case 'd':
            this.setPlayerAction(1, 0)
            break
          case ' ':
          case 'Enter':
            this.setPlayerAction(0, 0)
            break
          case '.':
          case 'q':
            this.renderHudSystem.setActive(true)
            this.render()
            break
          case 'l':
          case '`':
            this.historyViewer.setActive(true)
            this.render()
            break
        }
      }
    }
  }

  mouseMove(event: MouseEvent | WheelEvent) {
    if (this.playerTurn) {
      if (this.renderHudSystem.active) {
        if (
          this.renderHudSystem.handleMouseInput(
            event,
            this.getMousePosFromEvent(event),
          )
        ) {
          this.render()
        }
      } else if (this.historyViewer.active) {
        if (
          this.historyViewer.handleMouseInput(
            event as WheelEvent,
            this.getMousePosFromEvent(event),
          )
        ) {
          this.render()
        }
      }
    }
  }

  getMousePosFromEvent(event: MouseEvent) {
    const mousePosition = this.display.eventToPosition(event)
    return { x: mousePosition[0], y: mousePosition[1] }
  }

  setPlayerAction(xOffset: number, yOffset: number) {
    const newPosition = { ...PositionComponent.position[this.player] }
    newPosition.x += xOffset
    newPosition.y += yOffset

    const action = ActionComponent.action[this.player]
    action.xOffset = xOffset
    action.yOffset = yOffset
    action.processed = false

    this.update()
  }
}
