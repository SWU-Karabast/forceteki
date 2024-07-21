import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EffectNames, EventNames } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface SendHomeProperties extends CardActionProperties {}

export class SendHomeAction extends CardGameAction {
    name = 'sendHome';
    eventName = EventNames.OnSendHome;
    cost = 'moving home {0}';
    effect = 'send {0} home';
    targetType = [CardTypes.Character];

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        return (
            super.canAffect(card, context) &&
            card.isParticipating() &&
            !card.anyEffect(EffectNames.ParticipatesFromHome)
        );
    }

    eventHandler(event): void {
        event.context.game.currentConflict.removeFromConflict(event.card);
    }
}
