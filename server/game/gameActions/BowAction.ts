import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EventNames, Locations } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface BowActionProperties extends CardActionProperties {}

export class BowAction extends CardGameAction<BowActionProperties> {
    name = 'bow';
    eventName = EventNames.OnCardBowed;
    cost = 'bowing {0}';
    effect = 'bow {0}';
    targetType = [CardTypes.Character, CardTypes.Attachment, CardTypes.Stronghold];

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        if ((card.location !== Locations.PlayArea && card.type !== CardTypes.Stronghold) || card.bowed) {
            return false;
        }
        return super.canAffect(card, context);
    }

    eventHandler(event): void {
        event.card.bow();
    }
}