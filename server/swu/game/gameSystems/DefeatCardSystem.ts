import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardType, EventName, Location } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { isArena } from '../core/utils/EnumHelpers';

export interface IDefeatCardProperties extends ICardTargetSystemProperties {}

export class DefeatCardSystem extends CardTargetSystem<IDefeatCardProperties> {
    name = 'defeat';
    eventName = EventName.OnCardDefeated;
    cost = 'defeating {0}';
    targetType = [CardType.Unit, CardType.Upgrade];

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