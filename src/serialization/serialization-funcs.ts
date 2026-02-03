import {
  createWorld,
  getAllEntities,
  query,
  type World,
  addEntity,
  hasComponent,
} from 'bitecs'
import { Map } from '../map'

import type { SerializedEntity, SerializedWorld } from './serialized-world'
import {
  getDataFromComponent,
  OwnerComponent,
  PositionComponent,
  setDataForComponent,
  WorldComponents,
} from '../ecs/components'
import { MessageLog } from '../utils/message-log'

export const serializeWorld = (world: World, map: Map, log: MessageLog) => {
  const entities = getAllEntities(world)
  const serializedEntities = entities.map((e) => {
    const components = WorldComponents.map((componentType) => {
      if (hasComponent(world, e, componentType)) {
        return getDataFromComponent(e, componentType)
      } else {
        return undefined
      }
    }).filter((a) => a !== undefined)

    return {
      savedId: e,
      components,
    } as SerializedEntity
  })

  return {
    width: map.width,
    height: map.height,
    level: map.level,
    messages: log.messages,
    tiles: map.tiles,
    serializedEntities: serializedEntities,
  } as SerializedWorld
}

export const deserializeWorld = (saveGame: string) => {
  const parsedWorld: SerializedWorld = JSON.parse(saveGame)
  const world = createWorld()

  parsedWorld.serializedEntities.forEach((se) => {
    se.loadedId = addEntity(world)

    se.components.forEach((c) => {
      setDataForComponent(world, se.loadedId!, c.componentType, c.data)
    })
  })

  for (const eid of query(world, [OwnerComponent])) {
    const ownerComponent = OwnerComponent.owner[eid]
    const newOwner = parsedWorld.serializedEntities.find(
      (a) => a.savedId === ownerComponent.owner,
    )
    ownerComponent.owner = newOwner!.loadedId!
  }

  const map = new Map(
    world,
    parsedWorld.width,
    parsedWorld.height,
    parsedWorld.level,
    parsedWorld.tiles,
  )

  for (const eid of query(world, [PositionComponent])) {
    const position = PositionComponent.position[eid]
    map.addEntityAtLocation(eid, position)
  }

  const log = new MessageLog()
  log.messages = parsedWorld.messages

  return {
    world,
    map,
    log,
    level: parsedWorld.level,
  }
}
