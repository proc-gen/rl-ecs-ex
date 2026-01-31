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
  UpdateTurnsLeftSystem,
} from './ecs/systems/update-systems'
import { Map } from './map'
import { DefaultGenerator, type Generator } from './map/generators'
import type { HandleInputInfo, Vector2 } from './types'
import { createPlayer } from './ecs/templates'
import { MessageLog } from './utils/message-log'
import { InventoryWindow, MessageHistoryWindow, TargetingWindow } from './windows'
import { processPlayerFOV } from './utils/fov-funcs'

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
  inventoryWindow: InventoryWindow
  targetingWindow: TargetingWindow
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

    this.generator = new DefaultGenerator(
      this.world,
      this.map,
      10,
      5,
      12,
      10,
      4,
    )
    this.generator.generate()
    const startPosition = this.generator.playerStartPosition()

    this.player = createPlayer(this.world, startPosition)
    processPlayerFOV(
      this.map,
      PositionComponent.position[this.player],
      this.playerFOV,
    )

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
      new UpdateActionSystem(this.log, this.map, this.playerFOV),
      new UpdateWantUseItemSystem(this.log, this.map),
      new UpdateWantAttackSystem(this.log),
      new UpdateTurnsLeftSystem(this.log),
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

    this.historyViewer = new MessageHistoryWindow(this.log)
    this.inventoryWindow = new InventoryWindow(this.world, this.player)
    this.targetingWindow = new TargetingWindow(this.world, this.map, this.player, this.playerFOV)

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

    if (this.inventoryWindow.active) {
      this.inventoryWindow.render(this.display)
    } else if (this.historyViewer.active) {
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
      if(this.targetingWindow.active){
        const inputInfo = this.targetingWindow.handleKeyboardInput(event)
          this.handleInputInfo(inputInfo)
      } else if (this.inventoryWindow.active) {
        const inputInfo = this.inventoryWindow.handleKeyboardInput(event)
        this.handleInputInfo(inputInfo)
      } else if (this.renderHudSystem.active) {
        const inputInfo = this.renderHudSystem.handleKeyboardInput(event)
        this.handleInputInfo(inputInfo)
      } else if (this.historyViewer.active) {
        const inputInfo = this.historyViewer.handleKeyboardInput(event)
        this.handleInputInfo(inputInfo)
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
          case 'e':
          case 'g':
            this.setPlayerAction(0, 0, true)
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
          case 'Tab':
          case 'i':
            this.inventoryWindow.setActive(true)
            this.render()
            break
        }
      }
    }
  }

  mouseMove(event: MouseEvent | WheelEvent) {
    if (this.playerTurn) {
      
      if (this.targetingWindow.active) {
        const inputInfo = this.targetingWindow.handleMouseInput(
          event,
          this.getMousePosFromEvent(event),
        )
        this.handleInputInfo(inputInfo)
      } else if (this.inventoryWindow.active) {
        const inputInfo = this.inventoryWindow.handleMouseInput(
          event,
          this.getMousePosFromEvent(event),
        )
        this.handleInputInfo(inputInfo)
      } else if (this.renderHudSystem.active) {
        const inputInfo = this.renderHudSystem.handleMouseInput(
          event,
          this.getMousePosFromEvent(event),
        )
        this.handleInputInfo(inputInfo)
      } else if (this.historyViewer.active) {
        const inputInfo = this.historyViewer.handleMouseInput(
          event as WheelEvent,
          this.getMousePosFromEvent(event),
        )
        this.handleInputInfo(inputInfo)
      }
    }
  }

  handleInputInfo(inputInfo: HandleInputInfo) {
    if (inputInfo.needUpdate) {
      this.inventoryWindow.setActive(false)
      this.targetingWindow.setActive(false)
      this.historyViewer.setActive(false)
      this.renderHudSystem.setActive(false)
      this.update()
    } else if (inputInfo.needRender) {
      this.render()
    } else if (inputInfo.needTargeting !== undefined){
      this.targetingWindow.setActive(true)
      this.targetingWindow.setTargetingEntity(inputInfo.needTargeting)
      this.render()
    }
  }

  getMousePosFromEvent(event: MouseEvent) {
    const mousePosition = this.display.eventToPosition(event)
    return { x: mousePosition[0], y: mousePosition[1] }
  }

  setPlayerAction(
    xOffset: number,
    yOffset: number,
    pickUpItem: boolean = false,
  ) {
    const action = ActionComponent.action[this.player]
    action.xOffset = xOffset
    action.yOffset = yOffset
    action.pickUpItem = pickUpItem
    action.processed = false

    this.update()
  }
}
