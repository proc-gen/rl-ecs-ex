import { query, removeEntity, type EntityId, type World } from 'bitecs'
import type { UpdateSystem } from './update-system'
import { AnimationComponent, RemoveComponent } from '../../components'

export class UpdateRemoveAnimationSystem implements UpdateSystem {
  update(world: World, _entity: EntityId) {
    for (const eid of query(world, [AnimationComponent, RemoveComponent])) {
        removeEntity(world, eid)
    }
  }
}
