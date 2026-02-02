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
import { GameScreen } from './game-screen'

export class MainMenuScreen extends Screen {
  selectedOption: number
  windowPosition: Vector2
  windowDimension: Vector2
  renderPosition: Vector2
  options: string[]

  constructor(display: Display, manager: ScreenManager) {
    super(display, manager)

    this.selectedOption = 0
    this.windowPosition = { x: 24, y: 16 }
    this.windowDimension = { x: 28, y: 20 }
    this.renderPosition = { x: 27, y: 18 }

    this.options = ['New Game']

    if (localStorage.getItem('rogue-save') !== null) {
      this.options.push('Continue Game')
    }
  }

  keyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.selectedOption = Math.max(0, this.selectedOption - 1)
        this.render()
        break
      case 'ArrowDown':
      case 's':
        this.selectedOption = Math.min(
          this.options.length - 1,
          this.selectedOption + 1,
        )
        this.render()
        break
      case 'Enter':
        this.handleSelectedOption()
        break
    }
  }

  handleSelectedOption() {
    const option = this.options[this.selectedOption]

    switch (option) {
      case 'New Game':
        this.manager.setNextScreen(new GameScreen(this.display, this.manager))
        break
      case 'Continue Game':
        const saveGame = localStorage.getItem('rogue-save')
        this.manager.setNextScreen(
          new GameScreen(this.display, this.manager, saveGame!),
        )
    }
  }

  mouseMove(_event: MouseEvent | WheelEvent) {}

  render() {
    this.display.clear()

    renderWindowWithTitle(
      this.display,
      this.windowPosition,
      this.windowDimension,
      'Main Menu',
    )

    this.options.forEach((o, index) => {
      renderSingleLineTextOver(
        this.display,
        add(this.renderPosition, { x: 0, y: index }),
        `${this.selectedOption === index ? '->' : '  '} ${o}`,
        Colors.White,
        null,
      )
    })
  }
}
