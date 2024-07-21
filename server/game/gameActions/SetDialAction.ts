import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface SetDialProperties extends PlayerActionProperties {
    value: number;
}

export class SetDialAction extends PlayerAction {
    defaultProperties: SetDialProperties = { value: 0 };

    name = 'setDial';
    eventName = EventNames.OnSetHonorDial;
    constructor(propertyFactory: SetDialProperties | ((context: AbilityContext) => SetDialProperties)) {
        super(propertyFactory);
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as SetDialProperties;
        return ["set {0}'s dial to {1}", [properties.target, properties.value]];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties) as SetDialProperties;
        return properties.value > 0 && properties.value < 6 && super.canAffect(player, context);
    }

    addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        let { value } = this.getProperties(context, additionalProperties) as SetDialProperties;
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.value = value;
    }

    eventHandler(event): void {
        event.player.setShowBid(event.value);
    }
}
