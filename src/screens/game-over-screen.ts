import type { Display } from 'rot-js'
import { Screen } from './screen'
import {
  renderSingleLineTextOver,
  renderWindowWithTitle,
} from '../utils/render-funcs'
import type { Vector2 } from '../types'
import { add } from '../utils/vector-2-funcs'
import { Colors } from '../constants/colors'
import type { ScreenManager } from '../screen-manager'
import { MainMenuScreen } from './main-menu-screen'

export class GameOverScreen extends Screen {
  windowPosition: Vector2
  windowDimension: Vector2
  renderPosition: Vector2

  showBackToMainMenu: boolean

  constructor(display: Display, manager: ScreenManager) {
    super(display, manager)

    this.windowPosition = { x: 13, y: 16 }
    this.windowDimension = { x: 50, y: 20 }
    this.renderPosition = { x: 14, y: 18 }

    this.showBackToMainMenu = false

    window.setTimeout(() => {
      this.showBackToMainMenu = true
    }, 3000)
  }

  keyDown(event: KeyboardEvent) {
    if (this.showBackToMainMenu) {
      switch (event.key) {
        case 'Enter':
          this.manager.setNextScreen(
            new MainMenuScreen(this.display, this.manager),
          )
          break
      }
    }
  }

  mouseMove(_event: MouseEvent | WheelEvent) {}

  render() {
    this.display.clear()

    renderWindowWithTitle(
      this.display,
      this.windowPosition,
      this.windowDimension,
      'You met your doom, adventurer...',
    )

    if (this.showBackToMainMenu) {
      renderSingleLineTextOver(
        this.display,
        add(this.renderPosition, { x: 0, y: 7 }),
        '-> Back to Main Menu',
        Colors.White,
        null,
      )
    }
  }
}
