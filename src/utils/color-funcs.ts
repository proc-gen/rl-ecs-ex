import { Color } from "rot-js"

export const MixColors = (colorA: string, colorB: string) => {
    return Color.toHex(
        Color.multiply(
            Color.fromString(colorA), 
            Color.fromString(colorB)
        )
    )
}