import { Display } from 'rot-js'
import { MainMenuScreen, Screen } from './screens'

export class ScreenManager {
  public static readonly WIDTH = 80
  public static readonly HEIGHT = 50

  display: Display
  private currentScreen: Screen

  constructor() {
    this.display = new Display({
      width: ScreenManager.WIDTH,
      height: ScreenManager.HEIGHT,
      forceSquareRatio: true,
    })

    this.currentScreen = new MainMenuScreen(this.display, this)

    window.addEventListener('keydown', (e) => this.keyDown(e))
    window.addEventListener('mousemove', (e) => this.mouseMove(e))
    window.addEventListener('wheel', (e) => this.mouseMove(e))
  }

  keyDown(event: KeyboardEvent) {
    event.preventDefault()
    this.currentScreen.keyDown(event)
  }

  mouseMove(event: MouseEvent | WheelEvent) {
    this.currentScreen.mouseMove(event)
  }

  render() {
    this.currentScreen.render()
  }

  setNextScreen(screen: Screen){
    this.currentScreen = screen
    this.render()
  }
}
