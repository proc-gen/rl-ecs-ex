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
import type { Vector2 } from '../../../types'
import type { Map } from '../../../map'

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
      this.inspectLocation.x = PositionComponent.position[this.player].x
      this.inspectLocation.y = PositionComponent.position[this.player].y
    }
  }

  handleKeyboardInput(event: KeyboardEvent): boolean {
    let needRender = false
    if (this.active) {
      switch (event.key) {
        case 'ArrowUp':
          this.setInspectLocation(0, -1)
          needRender = true
          break
        case 'ArrowDown':
          this.setInspectLocation(0, 1)
          needRender = true
          break
        case 'ArrowLeft':
          this.setInspectLocation(-1, 0)
          needRender = true
          break
        case 'ArrowRight':
          this.setInspectLocation(1, 0)
          needRender = true
          break
        case 'Escape':
          this.active = false
          needRender = true
          break
      }
    }

    return needRender
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

  handleMouseInput(_event: MouseEvent, position: Vector2): boolean {
    let needRender = false
    if (this.active) {
      if (
        this.map.isInBounds(position.x, position.y) &&
        (this.inspectLocation.x !== position.x ||
          this.inspectLocation.y !== position.y)
      ) {
        this.inspectLocation.x = position.x
        this.inspectLocation.y = position.y
        needRender = true
      }
    }

    return needRender
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
      `Inspecting (${this.inspectLocation.x},${this.inspectLocation.y})`,
    ]

    if (this.map.tiles[this.inspectLocation.x][this.inspectLocation.y].seen) {
      atLocation.push(
        this.map.tiles[this.inspectLocation.x][this.inspectLocation.y].name,
      )

      if (
        this.playerFOV.find(
          (a) =>
            a.x === this.inspectLocation.x && a.y === this.inspectLocation.y,
        ) !== undefined
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
