import { hasComponent, type EntityId, type World } from 'bitecs'
import type { RenderWindow } from './render-window'
import type { Map } from '../map'
import type { InputController } from '../interfaces/input-controller'
import type { HandleInputInfo, Vector2 } from '../types'
import type { Display } from 'rot-js'
import {
  renderSingleLineTextOver,
  renderWindowWithTitle,
} from '../utils/render-funcs'
import {
  HealthComponent,
  InfoComponent,
  PositionComponent,
  SpellComponent,
} from '../ecs/components'
import { Colors } from '../constants/colors'
import { equal } from '../utils/vector-2-funcs'
import { processFOV } from '../utils/fov-funcs'

export class TargetingWindow implements InputController, RenderWindow {
  active: boolean
  windowPosition: Vector2
  windowDimension: Vector2
  renderPositionLine1: Vector2
  renderPositionLine2: Vector2

  world: World
  map: Map
  player: EntityId
  playerFOV: Vector2[]
  targetingEntity: EntityId
  targetPosition: Vector2
  targetRange: number
  targetFOV: Vector2[]

  constructor(world: World, map: Map, player: EntityId, playerFOV: Vector2[]) {
    this.active = false
    this.windowPosition = { x: 30, y: 0 }
    this.windowDimension = { x: 20, y: 4 }
    this.renderPositionLine1 = { x: 33, y: 2 }
    this.renderPositionLine2 = { x: 33, y: 3 }

    this.world = world
    this.map = map
    this.player = player
    this.playerFOV = playerFOV
    this.targetingEntity = -1
    this.targetPosition = { x: 0, y: 0 }
    this.targetRange = -1
    this.targetFOV = []
  }

  getActive(): boolean {
    return this.active
  }

  setActive(value: boolean): void {
    this.active = value
  }

  setTargetingEntity(targetingEntity: EntityId) {
    this.targetingEntity = targetingEntity
    this.targetPosition = { ...PositionComponent.position[this.player] }
    if (hasComponent(this.world, this.targetingEntity, SpellComponent)) {
      this.targetRange = SpellComponent.spell[this.targetingEntity].range
      this.targetFOV = processFOV(
        this.map,
        PositionComponent.position[this.player],
        this.targetRange,
      )
    }
  }

  handleKeyboardInput(event: KeyboardEvent): HandleInputInfo {
    const inputInfo = { needRender: false, needUpdate: false }
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.setTargetPosition(0, -1)
        inputInfo.needRender = true
        break
      case 'ArrowDown':
      case 's':
        this.setTargetPosition(0, 1)
        inputInfo.needRender = true
        break
      case 'ArrowLeft':
      case 'a':
        this.setTargetPosition(-1, 0)
        inputInfo.needRender = true
        break
      case 'ArrowRight':
      case 'd':
        this.setTargetPosition(1, 0)
        inputInfo.needRender = true
        break
      case 'Escape':
      case 'End':
        this.active = false
        inputInfo.needRender = true
        break
    }
    return inputInfo
  }

  setTargetPosition(xOffset: number, yOffset: number) {
    if (
      this.map.isInBounds(
        this.targetPosition.x + xOffset,
        this.targetPosition.y + yOffset,
      )
    ) {
      this.targetPosition.x += xOffset
      this.targetPosition.y += yOffset
    }
  }

  handleMouseInput(_event: MouseEvent, position: Vector2): HandleInputInfo {
    const inputInfo = { needRender: false, needUpdate: false }
    if (
      this.map.isInBounds(position.x, position.y) &&
      (this.targetPosition.x !== position.x ||
        this.targetPosition.y !== position.y)
    ) {
      this.targetPosition = { ...position }
      inputInfo.needRender = true
    }

    return inputInfo
  }

  render(display: Display) {
    this.renderWindow(display)
    this.renderTarget(display)
  }

  renderWindow(display: Display) {
    renderWindowWithTitle(
      display,
      this.windowPosition,
      this.windowDimension,
      'Targeting',
    )

    const itemInfo = InfoComponent.info[this.targetingEntity]
    renderSingleLineTextOver(
      display,
      this.renderPositionLine1,
      `Using ${itemInfo.name}`,
      Colors.White,
      null,
    )

    let name = 'Nothing'
    if (
      this.targetFOV.find((a) => equal(a, this.targetPosition)) !== undefined
    ) {
      const entitiesAtLocation = this.map.getEntitiesAtLocation(
        this.targetPosition,
      )

      const healthBlocker = entitiesAtLocation.find((a) =>
        hasComponent(this.windowDimension, a, HealthComponent),
      )
      if (healthBlocker !== undefined) {
        name = InfoComponent.info[healthBlocker].name
      }
    } else {
      name = 'Out of Range'
    }

    renderSingleLineTextOver(
      display,
      this.renderPositionLine2,
      `(${this.targetPosition.x}, ${this.targetPosition.y}) - ${name}`,
      Colors.White,
      null,
    )
  }

  renderTarget(display: Display) {
    display.drawOver(
      this.targetPosition.x,
      this.targetPosition.y,
      '',
      null,
      Colors.InspectLocation,
    )
  }
}
