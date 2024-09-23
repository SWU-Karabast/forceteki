import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { AbilityRestriction, EffectName, EventName, PlayType, RelativePlayer } from '../core/Constants.js';
import { putIntoPlay } from '../gameSystems/GameSystemLibrary.js';
import { Card } from '../core/card/Card';
import { GameEvent } from '../core/event/GameEvent.js';
import { PlayCardContext, PlayCardAction } from '../core/ability/PlayCardAction.js';
import * as Contract from '../core/utils/Contract.js';

export class PlayUnitAction extends PlayCardAction {
    public constructor(card: Card) {
        super(card, 'Play this unit');
    }

    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isUnit());

        const cardPlayedEvent = new GameEvent(EventName.OnCardPlayed, {
            player: context.player,
            card: context.source,
            context: context,
            originalLocation: context.source.location,
            originallyOnTopOfDeck:
                context.player && context.player.drawDeck && context.player.drawDeck[0] === context.source,
            onPlayCardSource: context.onPlayCardSource,
            playType: context.playType
        });

        context.game.addMessage(
            '{0} plays {1}',
            context.player,
            context.source,
        );
        const effect = context.source.getEffectValues(EffectName.EntersPlayForOpponent);
        const player = effect.length > 0 ? RelativePlayer.Opponent : RelativePlayer.Self;
        context.source.registerWhenPlayedKeywords();
        context.game.openEventWindow([
            putIntoPlay({
                controller: player
            }).generateEvent(context.source, context),
            cardPlayedEvent
        ], this.resolveTriggersAfter);
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            context.player.hasRestriction(AbilityRestriction.PlayUnit, context) ||
            context.player.hasRestriction(AbilityRestriction.PutIntoPlay, context) ||
            context.source.hasRestriction(AbilityRestriction.EnterPlay, context)
        ) {
            return 'restriction';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }
}
