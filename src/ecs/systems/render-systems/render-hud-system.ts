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

export class RenderHudSystem implements RenderSystem {
  player: EntityId

  constructor(player: EntityId) {
    this.player = player
  }

  render(display: Display, world: World) {
    renderBox(
      display,
      { x: 0, y: 45 },
      { x: 80, y: 5 },
      Colors.VeryDarkGrey,
      Colors.VeryDarkGrey,
    )
    this.renderHealthBar(display)
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
}
