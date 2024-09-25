import { AbilityRestriction } from '../core/Constants.js';
import { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract.js';
import { PlayCardContext } from '../core/ability/PlayCardAction.js';
import { SmuggleCardAction } from '../core/ability/SmuggleCardAction.js';
import { resourceCard } from '../gameSystems/GameSystemLibrary.js';

export class SmuggleEventAction extends SmuggleCardAction {
    public constructor(card: Card) {
        super(card, 'Smuggle this event');
    }

    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isEvent());

        context.game.addMessage(
            '{0} plays {1}',
            context.player,
            context.source,
        );
        context.game.openEventWindow([
            resourceCard({
                target: context.player.getTopCardOfDeck()
            }).generateEvent(context.source, context)
        ]);
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
