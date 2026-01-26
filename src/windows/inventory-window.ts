import type { EntityId, World } from 'bitecs'
import type { HandleInputInfo, Vector2 } from '../types'
import type { Display } from 'rot-js'
import { renderWindowWithTitle } from '../utils/render-funcs'
import type { InputController } from '../interfaces/input-controller'
import type { RenderWindow } from '.'

export class InventoryWindow implements InputController, RenderWindow {
  active: boolean
  windowPosition: Vector2
  windowDimension: Vector2

  world: World
  player: EntityId
  playerItems: EntityId[]

  constructor(world: World, player: EntityId) {
    this.active = false
    this.windowPosition = { x: 20, y: 10 }
    this.windowDimension = { x: 40, y: 30 }

    this.world = world
    this.player = player
    this.playerItems = []
  }

  getActive(): boolean {
    return this.active
  }

  setActive(value: boolean): void {
    this.active = value
  }

  handleKeyboardInput(event: KeyboardEvent): HandleInputInfo {
    const inputInfo = { needRender: false, needUpdate: false }
    if (this.active) {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          // Do something
          inputInfo.needRender = true
          break
        case 'ArrowDown':
        case 's':
          // Do something
          inputInfo.needRender = true
          break
        case 'Enter':
        case 'e':
          //Do something
          inputInfo.needRender = true
          break
        case 'Delete':
        case 'q':
          //Do something
          inputInfo.needRender = true
          break
        case 'Escape':
        case 'Delete':
          this.active = false
          inputInfo.needRender = true
          break
      }
    }

    return inputInfo
  }

  handleMouseInput(_event: MouseEvent, _position: Vector2): HandleInputInfo {
    return { needRender: false, needUpdate: false }
  }

  render(display: Display) {
    renderWindowWithTitle(
      display,
      this.windowPosition,
      this.windowDimension,
      'Inventory',
    )
  }
}
