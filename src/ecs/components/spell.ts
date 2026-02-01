export const SpellComponent = {
    spell: [] as Spell[]
}

export type Spell = {
    range: number
    damage: number
    radius?: number
    spellName: string
}