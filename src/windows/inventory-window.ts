import { hasComponent, query, type EntityId, type World } from 'bitecs'
import type { HandleInputInfo, Vector2 } from '../types'
import type { Display } from 'rot-js'
import {
  renderSingleLineTextOver,
  renderWindowWithTitle,
} from '../utils/render-funcs'
import type { InputController } from '../interfaces/input-controller'
import type { RenderWindow } from '.'
import {
  ActionComponent,
  EquipmentComponent,
  EquippableComponent,
  InfoComponent,
  ItemComponent,
  OwnerComponent,
  PlayerComponent,
  StatsComponent,
  TargetingComponent,
} from '../ecs/components'
import { ItemActionType } from '../constants/item-action-type'
import { Colors } from '../constants/colors'

export class InventoryWindow implements InputController, RenderWindow {
  active: boolean
  windowPosition: Vector2
  windowDimension: Vector2
  renderPosition: Vector2
  renderPositionRight: Vector2

  world: World
  player: EntityId
  playerItems: EntityId[]
  itemIndex: number

  constructor(world: World, player: EntityId) {
    this.active = false
    this.windowPosition = { x: 15, y: 10 }
    this.windowDimension = { x: 50, y: 30 }
    this.renderPosition = { x: 18, y: 12 }
    this.renderPositionRight = { x: 40, y: 12 }

    this.world = world
    this.player = player
    this.playerItems = []
    this.itemIndex = 0
  }

  getActive(): boolean {
    return this.active
  }

  setActive(value: boolean): void {
    this.active = value
    if (this.active) {
      this.playerItems.length = 0
      for (const eid of query(this.world, [OwnerComponent, ItemComponent])) {
        if (OwnerComponent.owner[eid].owner === this.player) {
          if (
            !hasComponent(this.world, eid, EquippableComponent) ||
            !EquippableComponent.equippable[eid].equipped
          )
            this.playerItems.push(eid)
        }
      }
      this.itemIndex = 0
    }
  }

  handleKeyboardInput(event: KeyboardEvent): HandleInputInfo {
    const inputInfo = { needRender: false, needUpdate: false }
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.itemIndex = Math.floor(Math.max(0, this.itemIndex - 1))
        inputInfo.needRender = true
        break
      case 'ArrowDown':
      case 's':
        this.itemIndex = Math.floor(
          Math.min(this.playerItems.length - 1, this.itemIndex + 1),
        )
        inputInfo.needRender = true
        break
      case 'Enter':
      case 'e':
        this.useItem(inputInfo)
        break
      case 'Delete':
      case 'q':
        this.setPlayerAction(
          this.playerItems[this.itemIndex],
          ItemActionType.Drop,
        )
        this.active = false
        inputInfo.needUpdate = true
        break
      case 'Escape':
      case 'End':
        this.active = false
        inputInfo.needRender = true
        break
    }

    return inputInfo
  }

  useItem(inputInfo: HandleInputInfo) {
    const entity = this.playerItems[this.itemIndex]
    if (hasComponent(this.world, entity, TargetingComponent)) {
      inputInfo.needTargeting = entity
    } else {
      this.setPlayerAction(entity, ItemActionType.Use)
      this.active = false
      inputInfo.needUpdate = true
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
      'Character',
    )

    this.renderInventoryItems(display)
    this.renderStats(display)
  }

  renderInventoryItems(display: Display) {
    let renderPos = { ...this.renderPosition }
    renderSingleLineTextOver(
      display,
      renderPos,
      'Inventory',
      Colors.White,
      null,
    )
    renderPos.y += 2

    if (this.playerItems.length > 0) {
      let i = 0

      while (i < 15 && i < this.playerItems.length) {
        const itemInfo = InfoComponent.info[this.playerItems[i]]
        const message = `${i === this.itemIndex ? `-> ` : `   `}${itemInfo.name}`
        renderSingleLineTextOver(
          display,
          renderPos,
          message,
          Colors.White,
          null,
        )

        i++
        renderPos.y++
      }
    } else {
      renderSingleLineTextOver(
        display,
        renderPos,
        'No items',
        Colors.White,
        null,
      )
    }
  }

  renderStats(display: Display) {
    let renderPos = { ...this.renderPositionRight }
    renderSingleLineTextOver(display, renderPos, 'Stats', Colors.White, null)
    renderPos.y += 2

    const playerStats = PlayerComponent.player[this.player]
    const stats = StatsComponent.stats[this.player]
    const equipment = EquipmentComponent.equipment[this.player]

    renderSingleLineTextOver(
      display,
      renderPos,
      `Level: ${playerStats.currentLevel}`,
      Colors.White,
      null,
    )
    renderPos.y++

    renderSingleLineTextOver(
      display,
      renderPos,
      `Current XP: ${playerStats.currentXp}`,
      Colors.White,
      null,
    )
    renderPos.y++

    renderSingleLineTextOver(
      display,
      renderPos,
      `XP for next level: ${playerStats.experienceToNextLevel}`,
      Colors.White,
      null,
    )
    renderPos.y++

    renderSingleLineTextOver(
      display,
      renderPos,
      `Strength: ${stats.currentStrength} (base: ${stats.strength})`,
      Colors.White,
      null,
    )
    renderPos.y++

    renderSingleLineTextOver(
      display,
      renderPos,
      `Defense: ${stats.currentDefense} (base: ${stats.defense})`,
      Colors.White,
      null,
    )
    renderPos.y += 2

    renderSingleLineTextOver(
      display,
      renderPos,
      `Armor: ${equipment.armor !== -1 ? InfoComponent.info[equipment.armor].name : ''}`,
      Colors.White,
      null,
    )
    renderPos.y++

    renderSingleLineTextOver(
      display,
      renderPos,
      `Weapon: ${equipment.weapon !== -1 ? InfoComponent.info[equipment.weapon].name : ''}`,
      Colors.White,
      null,
    )
    renderPos.y++
  }

  setPlayerAction(
    useItem: EntityId | undefined = undefined,
    itemActionType: string,
  ) {
    const action = ActionComponent.action[this.player]
    action.xOffset = 0
    action.yOffset = 0
    action.pickUpItem = false
    action.useItem = useItem
    action.itemActionType = itemActionType
    action.processed = false
  }
}
