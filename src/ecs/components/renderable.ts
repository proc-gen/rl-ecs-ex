export const RenderableComponent = {
  renderable: [] as Renderable[],
}

export type Renderable = {
  fg: string | null
  bg: string | null
  char: string
}
