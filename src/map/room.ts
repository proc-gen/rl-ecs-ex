import { Sector } from "./sector";

export class Room extends Sector {
    width: number
    height: number

    constructor(x: number, y: number, width: number, height: number){
        super(x, y)
        this.width = width
        this.height = height

        for(let i = x; i < x + width; i++){
            for(let j = y; j < y + height; j++){
                this.includedTiles.push({x: i, y: j})
            }
        }
    }

    intersects(other: Room): boolean {
        return (
            this.x <= other.x + other.width &&
            this.x + this.width >= other.x &&
            this.y <= other.y + other.height &&
            this.y + this.width >= other.y
        )
    }
}