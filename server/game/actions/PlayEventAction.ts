import { AbilityRestriction, EventName, ZoneName, PlayType } from '../core/Constants.js';
import * as Contract from '../core/utils/Contract.js';
import { PlayCardContext, PlayCardAction, IPlayCardActionProperties } from '../core/ability/PlayCardAction.js';
import { GameEvent } from '../core/event/GameEvent.js';

export class PlayEventAction extends PlayCardAction {
    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isEvent());

        context.game.addMessage(
            '{0} plays {1}',
            context.player,
            context.source,
        );

        this.moveEventToDiscard(context);
        context.game.resolveAbility(context.source.getEventAbility().createContext());
    }

    public override clone(overrideProperties: IPlayCardActionProperties) {
        return new PlayEventAction({ ...this.createdWithProperties, ...overrideProperties });
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
            events.push(this.generateSmuggleEvent(context));
        }

        context.game.openEventWindow(events);
    }
}
