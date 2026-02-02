import { ScreenManager } from './screen-manager'

const runGame = () => {
  const screenManager = new ScreenManager()

  const container = screenManager.display.getContainer()!
  document.getElementById('game-window')?.appendChild(container)

  setTimeout(() => {
    screenManager.render()
  }, 100)
}

window.addEventListener('DOMContentLoaded', () => {
  runGame()
})
