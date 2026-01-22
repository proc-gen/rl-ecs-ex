import { Engine } from './engine'

const runGame = () => {
  const engine = new Engine()

  const container = engine.display.getContainer()!
  document.getElementById('game-window')?.appendChild(container)
  
  setTimeout(() => {
    engine.render()
  }, 100)
}

window.addEventListener('DOMContentLoaded', () => {
  runGame()
})
