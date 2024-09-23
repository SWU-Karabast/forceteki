import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { AbilityRestriction } from '../core/Constants.js';
import { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract.js';
import { EventCard } from '../core/card/EventCard.js';
import { PlayCardContext, PlayCardAction } from '../core/ability/PlayCardAction.js';

export class PlayEventAction extends PlayCardAction {
    public constructor(card: Card) {
        super(card, 'Play this event');
    }

    public override executeHandler(context: PlayCardContext): void {
        // TODO THIS PR: try forcing context.source to be Card
        Contract.assertTrue(context.source.isEvent());

        context.game.addMessage(
            '{0} plays {1}',
            context.player,
            context.source,
        );
        context.game.resolveAbility((context.source as EventCard).getEventAbility().createContext());
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
