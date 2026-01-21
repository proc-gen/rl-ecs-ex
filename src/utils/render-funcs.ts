import type { Display } from 'rot-js'
import type { Vector2 } from '../types'

export const renderHorizontalColoredBar = (
  display: Display,
  position: Vector2,
  width: number,
  color: string,
) => {
  for (let i = position.x; i < position.x + width; i++) {
    display.draw(i, position.y, ' ', color, color)
  }
}

export const renderSingleLineTextOver = (
  display: Display,
  position: Vector2,
  text: string,
  fg: string,
  bg: string | null,
) => {
  for (let i = 0; i < text.length; i++) {
    display.drawOver(i + position.x, position.y, text[i], fg, bg)
  }
}

export const renderBox = (
  display: Display,
  position: Vector2,
  dimension: Vector2,
  fg: string,
  bg: string,
) => {
  for (let i = position.x; i < position.x + dimension.x; i++) {
    for (let j = position.y; j < position.y + dimension.y; j++) {
      display.draw(i, j, ' ', fg, bg)
    }
  }
}
