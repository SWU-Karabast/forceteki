import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { AbilityRestriction, PlayType } from '../core/Constants.js';
import { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract.js';
import { EventCard } from '../core/card/EventCard.js';
import { PlayCardContext, PlayCardAction } from '../core/ability/PlayCardAction.js';
import { resourceCard } from '../gameSystems/GameSystemLibrary.js';

export class PlayEventAction extends PlayCardAction {
    public constructor(card: Card, playType: PlayType = PlayType.PlayFromHand) {
        super(card, 'Play this event', playType);
    }

    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isEvent());

        context.game.addMessage(
            '{0} plays {1}',
            context.player,
            context.source,
        );
        if(this.playType === PlayType.Smuggle) {
            context.game.openEventWindow([
                resourceCard({
                    target: context.player.getTopCardOfDeck()
                }).generateEvent(context.source, context)
            ]);
        }
        context.game.resolveAbility(context.source.getEventAbility().createContext());
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            context.player.hasRestriction(AbilityRestriction.PlayEvent, context) ||
            context.source.hasRestriction(AbilityRestriction.Play, context)
        ) {
            return 'restriction';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }
}
