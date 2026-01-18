import { RNG } from "rot-js"

import { FLOOR_TILE } from "../../constants/tiles"
import type { Map } from "../map"
import { Room, type Sector } from "../containers"
import { clearMap, tunnel, type Generator } from "./generator"
import type { Vector2 } from "../../types"

export class DefaultGenerator implements Generator {
    map: Map
    rooms: Room[]
    tunnels: Sector[]

    minRoomSize: number
    maxRoomSize: number
    maxRooms: number

    constructor(map: Map, maxRooms: number, minRoomSize: number, maxRoomSize: number) {
        this.map = map
        this.rooms = []
        this.tunnels = []
        
        this.maxRooms = maxRooms
        this.minRoomSize = minRoomSize
        this.maxRoomSize = maxRoomSize
    }

    generate(): void {
        clearMap(this.map)
        
        this.createRooms()
        this.connectRooms()

        this.copyRoomsToMap()
        this.copyTunnelsToMap()
    }

    createRooms(){
        for(let i = 0; i < this.maxRooms; i++){
            const width = this.getRandomNumber(this.minRoomSize, this.maxRoomSize)
            const height = this.getRandomNumber(this.minRoomSize, this.maxRoomSize)
            
            const x = this.getRandomNumber(0, this.map.width - width - 1)
            const y = this.getRandomNumber(0, this.map.height - height - 1)

            this.addRoom(x, y, width, height)
        }
    }

    connectRooms(){
        for(let i = 0; i < this.rooms.length - 1; i++){
            this.tunnels.push(tunnel(this.rooms[i].center(), this.rooms[i+1].center()))
        }
    }

    getRandomNumber(min: number, max: number){
        return RNG.getUniformInt(min, max)
    }

    addRoom(x: number, y: number, width: number, height: number) {
        const newRoom = new Room(x, y, width, height)
        
        if(this.rooms.length === 0){
            this.rooms.push(newRoom)
            return true
        }
        else {
            let roomPossible = true
            let i = 0

            while(i < this.rooms.length && roomPossible){
                roomPossible = !this.rooms[i].intersects(newRoom)
                i++
            }

            if(roomPossible){
                this.rooms.push(newRoom)
                return true
            }
        }
    }

    copyRoomsToMap() {
        this.rooms.forEach(a => {
            a.includedTiles.forEach(t => {
                if(t.x > a.x && t.y > a.y && t.x < a.x + a.width - 1 && t.y < a.y + a.height - 1){
                    this.map.tiles[t.x][t.y] = { ...FLOOR_TILE }
                }
            })
        })
    }

    copyTunnelsToMap(){
        this.tunnels.forEach(a => {
            a.includedTiles.forEach(t => {
                this.map.tiles[t.x][t.y] = { ...FLOOR_TILE }
            })
        })
    }
    
    playerStartPosition(): Vector2 {
        const firstRoom = this.rooms[0]
        return firstRoom.center()
    }
}