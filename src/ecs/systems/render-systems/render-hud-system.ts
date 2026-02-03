import { type EntityId, type World } from 'bitecs'
import type { RenderSystem } from './render-system'
import type { Display } from 'rot-js'
import {
  HealthComponent,
  InfoComponent,
  PositionComponent,
} from '../../components'
import {
  renderBox,
  renderHorizontalColoredBar,
  renderSingleLineTextOver,
} from '../../../utils/render-funcs'
import { Colors } from '../../../constants/colors'
import type { MessageLog } from '../../../utils/message-log'
import type { InputController } from '../../../interfaces/input-controller'
import type { HandleInputInfo, Vector2 } from '../../../types'
import type { Map } from '../../../map'
import { equal } from '../../../utils/vector-2-funcs'

export class RenderHudSystem implements RenderSystem, InputController {
  world: World
  map: Map
  player: EntityId
  playerFOV: Vector2[]
  log: MessageLog
  active: boolean
  inspectLocation: Vector2

  constructor(
    world: World,
    map: Map,
    player: EntityId,
    log: MessageLog,
    playerFOV: Vector2[],
  ) {
    this.world = world
    this.map = map
    this.player = player
    this.playerFOV = playerFOV
    this.log = log
    this.active = false
    this.inspectLocation = { x: 0, y: 0 }
  }

  getActive(): boolean {
    return this.active
  }

  setActive(value: boolean): void {
    this.active = value
    if (this.active) {
      this.inspectLocation = { ...PositionComponent.position[this.player] }
    }
  }

  handleKeyboardInput(event: KeyboardEvent): HandleInputInfo {
    const inputInfo = { needRender: false, needUpdate: false }
    if (this.active) {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          this.setInspectLocation(0, -1)
          inputInfo.needRender = true
          break
        case 'ArrowDown':
        case 's':
          this.setInspectLocation(0, 1)
          inputInfo.needRender = true
          break
        case 'ArrowLeft':
        case 'a':
          this.setInspectLocation(-1, 0)
          inputInfo.needRender = true
          break
        case 'ArrowRight':
        case 'd':
          this.setInspectLocation(1, 0)
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

  setInspectLocation(xOffset: number, yOffset: number) {
    if (
      this.map.isInBounds(
        this.inspectLocation.x + xOffset,
        this.inspectLocation.y + yOffset,
      )
    ) {
      this.inspectLocation.x += xOffset
      this.inspectLocation.y += yOffset
    }
  }

  handleMouseInput(_event: MouseEvent, position: Vector2): HandleInputInfo {
    const inputInfo = { needRender: false, needUpdate: false }
    if (this.active) {
      if (
        this.map.isInBounds(position.x, position.y) &&
        (this.inspectLocation.x !== position.x ||
          this.inspectLocation.y !== position.y)
      ) {
        this.inspectLocation.x = position.x
        this.inspectLocation.y = position.y
        inputInfo.needRender = true
      }
    }

    return inputInfo
  }

  render(display: Display) {
    renderBox(
      display,
      { x: 0, y: 45 },
      { x: 80, y: 5 },
      Colors.VeryDarkGrey,
      Colors.VeryDarkGrey,
    )
    this.renderHealthBar(display)
    renderSingleLineTextOver(
      display,
      { x: 1, y: 46 },
      `Depth: ${this.map.level}`,
      Colors.White,
      null,
    )

    if (this.active) {
      this.renderInspection(display)
    } else {
      this.renderMessageLog(display)
    }
  }

  renderHealthBar(display: Display) {
    const health = HealthComponent.health[this.player]
    const barLocation = { x: 0, y: 45 }
    const totalWidth = 20
    const barWidth = Math.floor((health.current / health.max) * totalWidth)

    renderHorizontalColoredBar(
      display,
      barLocation,
      totalWidth,
      Colors.DarkGrey,
    )
    renderHorizontalColoredBar(display, barLocation, barWidth, Colors.HealthBar)

    const text = `HP: ${health.current} / ${health.max}`

    renderSingleLineTextOver(display, { x: 1, y: 45 }, text, Colors.White, null)
  }

  renderMessageLog(display: Display) {
    if (this.log.messages.length > 0) {
      let i = 0
      while (i < 5 && i < this.log.messages.length) {
        i++
        const message = this.log.messages[this.log.messages.length - i]
        renderSingleLineTextOver(
          display,
          { x: 21, y: 44 + i },
          message.text,
          message.fg,
          message.bg,
        )
      }
    }
  }

  renderInspection(display: Display) {
    display.drawOver(
      this.inspectLocation.x,
      this.inspectLocation.y,
      '',
      null,
      Colors.InspectLocation,
    )
    const atLocation = [
      `Inspecting (${this.inspectLocation.x}, ${this.inspectLocation.y})`,
    ]

    if (this.map.tiles[this.inspectLocation.x][this.inspectLocation.y].seen) {
      atLocation.push(
        this.map.tiles[this.inspectLocation.x][this.inspectLocation.y].name,
      )

      if (
        this.playerFOV.find((a) => equal(a, this.inspectLocation)) !== undefined
      ) {
        const entitiesAtLocation = this.map.getEntitiesAtLocation(
          this.inspectLocation,
        )
        if (entitiesAtLocation.length > 0) {
          entitiesAtLocation.forEach((entity) => {
            const info = InfoComponent.info[entity]
            atLocation.push(info.name)
          })
        }
      }
    } else {
      atLocation.push('Unknown')
    }

    for (let i = 0; i < atLocation.length; i++)
      renderSingleLineTextOver(
        display,
        { x: 21, y: 45 + i },
        atLocation[i],
        Colors.White,
        null,
      )
  }
}
