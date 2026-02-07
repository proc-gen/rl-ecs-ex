import type { World, EntityId } from 'bitecs'
import type { InputController } from '../interfaces/input-controller'
import type { HandleInputInfo, Vector2 } from '../types'
import type { RenderWindow } from './render-window'
import type { MessageLog } from '../utils/message-log'
import {
  HealthComponent,
  PlayerComponent,
  StatsComponent,
} from '../ecs/components'
import {
  renderSingleLineTextOver,
  renderWindowWithTitle,
} from '../utils/render-funcs'
import type { Display } from 'rot-js'
import { add } from '../utils/vector-2-funcs'
import { Colors } from '../constants/colors'

export class LevelUpWindow implements InputController, RenderWindow {
  active: boolean
  windowPosition: Vector2
  windowDimension: Vector2
  renderPosition: Vector2

  world: World
  log: MessageLog
  player: EntityId
  selectedOption: number

  constructor(world: World, log: MessageLog, player: EntityId) {
    this.active = false
    this.windowPosition = { x: 20, y: 10 }
    this.windowDimension = { x: 40, y: 10 }
    this.renderPosition = { x: 23, y: 12 }

    this.world = world
    this.log = log
    this.player = player
    this.selectedOption = 0
  }

  getActive(): boolean {
    return this.active
  }

  setActive(value: boolean): void {
    this.active = value
    if (this.active) {
      this.selectedOption = 0
      const playerStats = PlayerComponent.values[this.player]
      playerStats.levelUpBase +=
        playerStats.currentLevel * playerStats.levelUpFactor
      playerStats.currentLevel++
      playerStats.experienceToNextLevel +=
        playerStats.currentLevel * playerStats.levelUpFactor

      this.log.addMessage(
        `You have advanced to level ${playerStats.currentLevel}`,
      )
    }
  }

  handleKeyboardInput(event: KeyboardEvent): HandleInputInfo {
    const inputInfo: HandleInputInfo = { needRender: false, needUpdate: false }
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.selectedOption = Math.floor(Math.max(0, this.selectedOption - 1))
        inputInfo.needRender = true
        break
      case 'ArrowDown':
      case 's':
        this.selectedOption = Math.floor(Math.min(2, this.selectedOption + 1))
        inputInfo.needRender = true
        break
      case 'Enter':
      case 'e':
        this.processLevelUp()
        inputInfo.finishTurn = true
        inputInfo.needUpdate = true
        break
    }
    return inputInfo
  }

  processLevelUp() {
    const playerStats = StatsComponent.values[this.player]
    const playerHealth = HealthComponent.values[this.player]

    switch (this.selectedOption) {
      case 0:
        playerHealth.current += 20
        playerHealth.max += 20
        this.log.addMessage('Your health improves!')
        break
      case 1:
        playerStats.strength++
        this.log.addMessage('You feel stronger!')
        break
      case 2:
        playerStats.defense++
        this.log.addMessage('Your movements become swifter!')
        break
    }
  }

  handleMouseInput(_event: MouseEvent, _position: Vector2): HandleInputInfo {
    return { needRender: false, needUpdate: false }
  }

  render(display: Display) {
    renderWindowWithTitle(
      display,
      this.windowPosition,
      this.windowDimension,
      'Level Up',
    )

    renderSingleLineTextOver(
      display,
      add(this.renderPosition, { x: 0, y: 0 }),
      'Congratulations, you leveled up!',
      Colors.White,
      null,
    )

    renderSingleLineTextOver(
      display,
      add(this.renderPosition, { x: 0, y: 1 }),
      'Select an attribute to increase:',
      Colors.White,
      null,
    )

    renderSingleLineTextOver(
      display,
      add(this.renderPosition, { x: 0, y: 3 }),
      `${this.selectedOption === 0 ? '->' : '  '} Increase Health (+20 HP)`,
      Colors.White,
      null,
    )

    renderSingleLineTextOver(
      display,
      add(this.renderPosition, { x: 0, y: 4 }),
      `${this.selectedOption === 1 ? '->' : '  '} Increase Strength (+1 damage)`,
      Colors.White,
      null,
    )

    renderSingleLineTextOver(
      display,
      add(this.renderPosition, { x: 0, y: 5 }),
      `${this.selectedOption === 2 ? '->' : '  '} Increase Defense (+1 defense)`,
      Colors.White,
      null,
    )
  }
}
