import type { AbilityContext } from '../AbilityContext';
import { CardTypes, EventNames } from '../Constants';
import type { ProvinceCard } from '../ProvinceCard';
import type BaseCard from '../basecard';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface BreakProperties extends CardActionProperties {}

export class BreakAction extends CardGameAction {
    name = 'break';
    eventName = EventNames.OnBreakProvince;
    targetType = [CardTypes.Province];
    cost = 'breaking {0}';
    effect = 'break {0}';

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        if (!card.isProvince || card.isBroken) {
            return false;
        }
        return super.canAffect(card, context);
    }

    addPropertiesToEvent(event, card: ProvinceCard, context: AbilityContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.conflict = context.game.currentConflict;
    }

    eventHandler(event): void {
        event.card.breakProvince();
    }
}
