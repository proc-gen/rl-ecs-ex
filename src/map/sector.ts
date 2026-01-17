export class Sector {
    x: number
    y: number
    includedTiles: {x: number, y: number}[]

    constructor(x: number, y: number){
        this.x = x
        this.y = y
        this.includedTiles = []
    }

    intersects(other: Sector){
        return false
    }
}