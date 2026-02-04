export const PlayerComponent = {
  player: [] as Player[],
}

export type Player = {
  levelUpBase: number
  currentLevel: number
  currentXp: number
  levelUpFactor: number
  experienceToNextLevel: number
}
