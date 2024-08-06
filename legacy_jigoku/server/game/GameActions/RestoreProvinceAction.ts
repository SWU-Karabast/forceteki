import type { AbilityContext } from '../AbilityContext';
import { CardTypes, EventNames } from '../Constants';
import type { ProvinceCard } from '../ProvinceCard';
import type BaseCard from '../basecard';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface RestoreProvinceProperties extends CardActionProperties {}

export class RestoreProvinceAction extends CardGameAction {
    name = 'restoreProvince';
    eventName = EventNames.OnRestoreProvince;
    targetType = [CardTypes.Province];
    cost = 'restoring {0}';
    effect = 'restore {0}';

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        if (!card.isProvince) {
            return false;
        }
        if (!card.isBroken) {
            return false;
        }
        return super.canAffect(card, context);
    }

    addPropertiesToEvent(event, card: ProvinceCard, context: AbilityContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
    }

    eventHandler(event): void {
        event.card.restoreProvince();
    }
}
