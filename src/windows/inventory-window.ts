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
  InfoComponent,
  ItemComponent,
  OwnerComponent,
  TargetingComponent,
} from '../ecs/components'
import { ItemActionType } from '../constants/item-action-type'
import { Colors } from '../constants/colors'

export class InventoryWindow implements InputController, RenderWindow {
  active: boolean
  windowPosition: Vector2
  windowDimension: Vector2
  renderPosition: Vector2

  world: World
  player: EntityId
  playerItems: EntityId[]
  itemIndex: number

  constructor(world: World, player: EntityId) {
    this.active = false
    this.windowPosition = { x: 20, y: 10 }
    this.windowDimension = { x: 40, y: 30 }
    this.renderPosition = { x: 23, y: 12 }

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
      'Inventory',
    )

    this.renderInventoryItems(display)
  }

  renderInventoryItems(display: Display) {
    if (this.playerItems.length > 0) {
      let i = 0
      let renderPos = { ...this.renderPosition }

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
        this.renderPosition,
        'No items',
        Colors.White,
        null,
      )
    }
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
