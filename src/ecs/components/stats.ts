import type { Component } from './component'

export const StatsComponent: Component<Stats> = {
  values: [] as Stats[],
}

export type Stats = {
  strength: number
  currentStrength: number
  defense: number
  currentDefense: number
  xpGiven: number
}
