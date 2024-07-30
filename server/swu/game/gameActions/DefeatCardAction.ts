import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../card/basecard';
import { CardTypes, EventNames, Locations } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';
import { isArena } from '../Constants';

export interface DefeatCardProperties extends CardActionProperties {}

export class DefeatCardAction extends CardGameAction<DefeatCardProperties> {
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

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        if (!isArena(card.location)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    updateEvent(event, card: BaseCard, context: AbilityContext, additionalProperties): void {
        this.updateLeavesPlayEvent(event, card, context, additionalProperties);
    }

    eventHandler(event, additionalProperties = {}): void {
        this.leavesPlayEventHandler(event, additionalProperties);
    }
}