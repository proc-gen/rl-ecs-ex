export const ActionComponent = {
  action: [] as Action[],
}

export type Action = {
  processed: boolean
  xOffset: number
  yOffset: number
}
