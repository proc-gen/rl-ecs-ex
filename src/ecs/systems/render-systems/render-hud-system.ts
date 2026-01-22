import type { EntityId, World } from 'bitecs'
import type { RenderSystem } from './render-system'
import type { Display } from 'rot-js'
import { HealthComponent } from '../../components'
import {
  renderBox,
  renderHorizontalColoredBar,
  renderSingleLineTextOver,
} from '../../../utils/render-funcs'
import { Colors } from '../../../constants/colors'
import type { MessageLog } from '../../../utils/message-log'

export class RenderHudSystem implements RenderSystem {
  player: EntityId
  log: MessageLog

  constructor(player: EntityId, log: MessageLog) {
    this.player = player
    this.log = log
  }

  render(display: Display, _world: World) {
    renderBox(
      display,
      { x: 0, y: 45 },
      { x: 80, y: 5 },
      Colors.VeryDarkGrey,
      Colors.VeryDarkGrey,
    )
    this.renderHealthBar(display)
    this.renderMessageLog(display)
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
}
