import { hasComponent, query, removeEntity, type EntityId, type World } from 'bitecs'
import type { UpdateSystem } from './update-system'
import { DeadComponent, InfoComponent, PositionComponent, RemoveComponent } from '../../components'
import { createCorpse } from '../../templates'
import type { Map } from '../../../map'

export class UpdateRemoveSystem implements UpdateSystem {
  map: Map

  constructor(map: Map){
    this.map = map
  }

  update(world: World, _entity: EntityId) {
    for (const eid of query(world, [RemoveComponent])) {
      if(hasComponent(world, eid, DeadComponent)){
        const position = PositionComponent.position[eid]
        const corpse = createCorpse(world, position, InfoComponent.info[eid].name)
        this.map.addEntityAtLocation(corpse, position)
        this.map.removeEntityAtLocation(eid, position)
      }
      removeEntity(world, eid)
    }
  }
}
