import { Display } from 'rot-js'
import { createWorld, addEntity, addComponent, type World, type EntityId } from 'bitecs'
import { PositionComponent } from './ecs/components'

export class Engine {
  public static readonly WIDTH = 80
  public static readonly HEIGHT = 50

  display: Display
  world: World
  player: EntityId

  constructor() {
    this.display = new Display({ width: Engine.WIDTH, height: Engine.HEIGHT })
    this.world = createWorld()

    this.player = addEntity(this.world)
    addComponent(this.world, this.player, PositionComponent)
    PositionComponent.position[this.player] = { x: Engine.WIDTH / 2, y: Engine.HEIGHT / 2 }

    window.addEventListener('keydown', (event) => {
      this.update(event)
    })
  }

  render() {
    this.display.clear();
    const position = PositionComponent.position[this.player]
    this.display.draw(position.x, position.y, '@', '#fff', '#000')
  }

  update(event: KeyboardEvent) {
    event.preventDefault()
    switch (event.key) {
      case 'ArrowUp':
        PositionComponent.position[this.player].y -= 1
        break
      case 'ArrowDown':
        PositionComponent.position[this.player].y += 1
        break
      case 'ArrowLeft':
        PositionComponent.position[this.player].x -= 1
        break
      case 'ArrowRight':
        PositionComponent.position[this.player].x += 1
        break
    }

    this.render()
  }


}