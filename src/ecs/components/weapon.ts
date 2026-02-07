import type { Component } from './component'

export const WeaponComponent: Component<Weapon> = {
  values: [] as Weapon[],
}

export type Weapon = {
  attack: number
}
