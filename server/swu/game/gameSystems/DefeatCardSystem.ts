import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardTypes, EventNames, Locations } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { isArena } from '../core/Constants';

export interface IDefeatCardProperties extends ICardTargetSystemProperties {}

export class DefeatCardSystem extends CardTargetSystem<IDefeatCardProperties> {
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