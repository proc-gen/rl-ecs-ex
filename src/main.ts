import { ScreenManager } from './screen-manager'

const runGame = () => {
  const screenManager = new ScreenManager()

  const container = screenManager.display.getContainer()!
  document.getElementById('game-window')?.appendChild(container)

  renderLoop(screenManager)
}

const renderLoop = (screenManager: ScreenManager) => {
  setTimeout(() => {
    screenManager.render()
    renderLoop(screenManager)
  }, 50)
}

window.addEventListener('DOMContentLoaded', () => {
  runGame()
})
