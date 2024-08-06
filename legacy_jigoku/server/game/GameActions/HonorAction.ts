import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, CharacterStatus, EventNames, Locations } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface HonorProperties extends CardActionProperties {}

export class HonorAction extends CardGameAction {
    name = 'honor';
    eventName = EventNames.OnCardHonored;
    targetType = [CardTypes.Character];
    cost = 'honoring {0}';
    effect = 'honor {0}';

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        if (card.location !== Locations.PlayArea || card.type !== CardTypes.Character || card.isHonored) {
            return false;
        } else if (!card.isDishonored && !card.checkRestrictions('receiveHonorToken', context)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    eventHandler(event): void {
        event.card.honor();
        if (event.card.isHonored) {
            event.card.game.raiseEvent(EventNames.OnStatusTokenGained, {
                token: event.card.getStatusToken(CharacterStatus.Honored),
                card: event.card
            });
        }
    }
}
