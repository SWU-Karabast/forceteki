import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, CharacterStatus, EventNames, Locations } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface TaintProperties extends CardActionProperties {}

export class TaintAction extends CardGameAction {
    name = 'taint';
    eventName = EventNames.OnCardTainted;
    targetType = [CardTypes.Character, CardTypes.Province];
    cost = 'tainting {0}';
    effect = 'taint {0}';

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        if (card.isTainted) {
            return false;
        }
        if (!this.targetType.includes(card.type)) {
            return false;
        }
        if (card.type === CardTypes.Character && card.location !== Locations.PlayArea) {
            return false;
        }
        if (!card.checkRestrictions('receiveTaintedToken', context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    eventHandler(event): void {
        event.card.taint();
        event.card.game.raiseEvent(EventNames.OnStatusTokenGained, {
            token: event.card.getStatusToken(CharacterStatus.Tainted),
            card: event.card
        });
    }
}
