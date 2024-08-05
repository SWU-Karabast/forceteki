import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardTypes, EventNames, Locations } from '../core/Constants';
import { type CardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { isArena } from '../core/Constants';

export interface DefeatCardProperties extends CardTargetSystemProperties {}

export class DefeatCardSystem extends CardTargetSystem<DefeatCardProperties> {
    name = 'defeat';
    eventName = EventNames.OnCardDefeated;
    cost = 'defeating {0}';
    targetType = [CardTypes.Unit, CardTypes.Upgrade];

    constructor(propertyFactory) {
        super(propertyFactory);
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context);
        return ['defeat {0}', [properties.target]];
    }

    canAffect(card: Card, context: AbilityContext): boolean {
        if (!isArena(card.location)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    updateEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        this.updateLeavesPlayEvent(event, card, context, additionalProperties);
    }

    eventHandler(event, additionalProperties = {}): void {
        this.leavesPlayEventHandler(event, additionalProperties);
    }
}