import type { AbilityContext } from '../AbilityContext';
import { Durations, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import Effects from '../effects';
import type { WhenType } from '../Interfaces';
import type { GameActionProperties } from './GameAction';
import { LastingEffectCardAction, type LastingEffectCardProperties } from './LastingEffectCardAction';

export interface TakeControlProperties extends GameActionProperties {
    duration?: Durations;
    until?: WhenType;
    effect?: any;
    targetLocation?: Locations | Locations[];
}

export class TakeControlAction extends LastingEffectCardAction {
    name = 'takeControl';
    effect = 'take control of {0}';
    defaultProperties: LastingEffectCardProperties = {
        duration: Durations.Custom,
        targetLocation: Locations.PlayArea,
        effect: null
    };

    constructor(properties: ((context: AbilityContext) => TakeControlProperties) | TakeControlProperties) {
        super(properties as LastingEffectCardProperties);
    }

    getProperties(context: AbilityContext, additionalProperties = {}) {
        const properties = super.getProperties(context, additionalProperties);
        if (properties.effect.length === 0 || !properties.effect[0]) {
            properties.effect = [Effects.takeControl(context.player)];
        }
        return properties;
    }

    canAffect(card: DrawCard, context: AbilityContext, additionalProperties = {}): boolean {
        return !card.anotherUniqueInPlay(context.player) && super.canAffect(card, context, additionalProperties);
    }

    eventHandler(event, additionalProperties): void {
        let properties = this.getProperties(event.context, additionalProperties);
        event.context.source[properties.duration](() => Object.assign({ match: event.card }, properties));
    }
}