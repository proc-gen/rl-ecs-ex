import { addComponents, addEntity, type EntityId, type World } from "bitecs";
import type { Vector2 } from "../../types";
import type { Map } from "../../map";
import { AnimationComponent, InfoComponent, LightComponent, PositionComponent, RenderableComponent, RenderLayerAboveComponent } from "../components";
import { AnimationTypes, Colors, LightTypes, type AnimationType, type LightType } from "../../constants";

export const createAnimation = (world: World, map: Map, entity: EntityId, position: Vector2, positionEnd: Vector2 | undefined = undefined) => {
    const name = InfoComponent.values[entity].name

    switch(name){
        case 'Health Potion':
            createHealthPotionAnimation(world, position)
            break
        case 'Lightning Scroll':
            createLightningAnimation(world, map, position)
            break
    }
}

const createHealthPotionAnimation = (world: World, position: Vector2) => {
    const animateCharacter = addEntity(world)
    addComponents(world, animateCharacter, AnimationComponent, RenderableComponent, PositionComponent, RenderLayerAboveComponent)

    AnimationComponent.values[animateCharacter] = {
        animationRate: 50,
        animationType: AnimationTypes.FlashCharacter as AnimationType,
        animationTimeLeft: 1000,
        animationTotalTime: 1000,
    }
    RenderableComponent.values[animateCharacter] = {
        char: '¡',
        fg: Colors.HealthBar,
        bg: null,
        alwaysShow: true,
    }
    PositionComponent.values[animateCharacter] = {...position}

    const animateLight = addEntity(world)
    addComponents(world, animateLight, AnimationComponent, LightComponent, PositionComponent)

    AnimationComponent.values[animateLight] = {
        animationRate: 50,
        animationType: AnimationTypes.FlashLight as AnimationType,
        animationTimeLeft: 1000,
        animationTotalTime: 1000,
    }
    LightComponent.values[animateLight] = {
        color: Colors.HealthBar,
        intensity: 1,
        lightType: LightTypes.Point as LightType,
        blockable: false
    }
    PositionComponent.values[animateLight] = {...position}
}

const createLightningAnimation = (world: World, map: Map, position: Vector2) => {

}