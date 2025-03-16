import { AbilityRestriction, ZoneName, PlayType } from '../core/Constants.js';
import * as Contract from '../core/utils/Contract.js';
import type { PlayCardContext, IPlayCardActionProperties } from '../core/ability/PlayCardAction.js';
import { PlayCardAction } from '../core/ability/PlayCardAction.js';

export class PlayEventAction extends PlayCardAction {
    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isEvent());

        this.moveEventToDiscard(context);
        context.game.resolveAbility(context.source.getEventAbility().createContext());
    }

    public override clone(overrideProperties: Partial<Omit<IPlayCardActionProperties, 'playType'>>) {
        return new PlayEventAction(this.game, this.card, { ...this.createdWithProperties, ...overrideProperties });
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

    public moveEventToDiscard(context: PlayCardContext) {
        const cardPlayedEvent = this.generateOnPlayEvent(context, {
            resolver: this,
            handler: () => context.source.moveTo(ZoneName.Discard)
        });

        const events = [cardPlayedEvent];

        if (context.playType === PlayType.Smuggle) {
            this.addSmuggleEvent(events, context);
        }

        context.game.openEventWindow(events);
    }
}
