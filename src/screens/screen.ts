import type { Display } from 'rot-js'

export abstract class Screen {
  display: Display

  constructor(display: Display) {
    this.display = display
  }

  abstract keyDown(event: KeyboardEvent): void
  abstract mouseMove(event: MouseEvent | WheelEvent): void
  abstract render(): void
}
