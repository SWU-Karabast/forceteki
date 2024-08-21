import type { AbilityContext } from '../core/ability/AbilityContext.js';
import PlayerAction from '../core/ability/PlayerAction.js';
import { AbilityRestriction, EffectName, EventName, Location, PhaseName, PlayType, RelativePlayer } from '../core/Constants.js';
import { payAdjustableResourceCost } from '../costs/CostLibrary.js';
import { putIntoPlay } from '../gameSystems/GameSystemLibrary.js';
import { Card } from '../core/card/Card';
import type Player from '../core/Player.js';
import { GameEvent } from '../core/event/GameEvent.js';

type ExecutionContext = AbilityContext & { onPlayCardSource: any };

export class PlayUnitAction extends PlayerAction {
    public constructor(card: Card) {
        super(card, 'Play this unit', [payAdjustableResourceCost()]);
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            !ignoredRequirements.includes('phase') &&
            context.game.currentPhase !== PhaseName.Action
        ) {
            return 'phase';
        }
        if (
            !ignoredRequirements.includes('location') &&
            !context.player.isCardInPlayableLocation(context.source, PlayType.PlayFromHand)
        ) {
            return 'location';
        }
        if (
            !ignoredRequirements.includes('cannotTrigger') &&
            !context.source.canPlay(context, PlayType.PlayFromHand)
        ) {
            return 'cannotTrigger';
        }
        if (
            context.player.hasRestriction(AbilityRestriction.PlayUnit, context) ||
            context.player.hasRestriction(AbilityRestriction.PutIntoPlay, context)
        ) {
            return 'restriction';
        }
        return super.meetsRequirements(context);
    }

    public override createContext(player: RelativePlayer = this.card.controller) {
        const context = super.createContext(player);
        context.costAspects = this.card.aspects;
        return context;
    }

    public override executeHandler(context: ExecutionContext): void {
        const cardPlayedEvent = new GameEvent(EventName.OnCardPlayed, {
            player: context.player,
            card: context.source,
            context: context,
            originalLocation: context.source.location,
            originallyOnTopOfDeck:
                context.player && context.player.drawDeck && context.player.drawDeck[0] === context.source,
            onPlayCardSource: context.onPlayCardSource,
            playType: PlayType.PlayFromHand
        });

        context.game.addMessage(
            '{0} plays {1}',
            context.player,
            context.source,
        );
        const effect = context.source.getEffectValues(EffectName.EntersPlayForOpponent);
        const player = effect.length > 0 ? RelativePlayer.Opponent : RelativePlayer.Self;
        context.game.openEventWindow([
            putIntoPlay({
                controller: player
            }).generateEvent(context.source, context),
            cardPlayedEvent
        ]);
    }

    public override isCardPlayed(): boolean {
        return true;
    }
}
