import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type DrawCard from '../drawcard';
import type Player from '../player';
import type Ring from '../ring';
import { RingAction, type RingActionProperties } from './RingAction';

export interface PlaceFateRingProperties extends RingActionProperties {
    amount?: number;
    origin?: DrawCard | Player | Ring;
}

export class PlaceFateRingAction extends RingAction {
    name = 'placeFate';
    eventName = EventNames.OnMoveFate;
    defaultProperties: PlaceFateRingProperties = { amount: 1 };
    constructor(properties: ((context: AbilityContext) => PlaceFateRingProperties) | PlaceFateRingProperties) {
        super(properties);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        let properties: PlaceFateRingProperties = this.getProperties(context);
        return ['placing {1} fate on the {0}', [properties.amount, properties.target]];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties: PlaceFateRingProperties = this.getProperties(context);
        if (properties.origin) {
            return ['move {1} fate from {2} to {0}', [properties.target, properties.amount, properties.origin]];
        }
        return ['place {1} fate on {0}', [properties.target, properties.amount]];
    }

    canAffect(ring: Ring, context: AbilityContext, additionalProperties = {}): boolean {
        let properties: PlaceFateRingProperties = this.getProperties(context, additionalProperties);
        if (
            properties.origin &&
            (!properties.origin.checkRestrictions('spendFate', context) || properties.origin.fate === 0)
        ) {
            return false;
        }
        return properties.amount > 0 && super.canAffect(ring, context);
    }

    addPropertiesToEvent(event, ring: Ring, context: AbilityContext, additionalProperties): void {
        let { amount, origin } = this.getProperties(context, additionalProperties) as PlaceFateRingProperties;
        event.fate = amount;
        event.origin = origin;
        event.context = context;
        event.recipient = ring;
    }

    checkEventCondition(event): boolean {
        return this.moveFateEventCondition(event);
    }

    isEventFullyResolved(event, ring: Ring, context: AbilityContext, additionalProperties): boolean {
        let { amount, origin } = this.getProperties(context, additionalProperties) as PlaceFateRingProperties;
        return (
            !event.cancelled &&
            event.name === this.eventName &&
            event.fate === amount &&
            event.origin === origin &&
            event.recipient === ring
        );
    }

    eventHandler(event): void {
        this.moveFateEventHandler(event);
    }
}
