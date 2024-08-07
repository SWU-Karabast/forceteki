import type { AbilityContext } from '../core/ability/AbilityContext.js';
import BaseAction from '../core/ability/PlayerAction.js';
import { EffectName, EventName, Location, PhaseName, PlayType, RelativePlayer } from '../core/Constants.js';
import { payAdjustableResourceCost } from '../costs/CostLibrary.js';
import { putIntoPlay } from '../gameSystems/GameSystemLibrary.js';
import type Card from '../core/card/Card.js';
import type Player from '../core/Player.js';

type ExecutionContext = AbilityContext & { onPlayCardSource: any };

export class PlayUnitAction extends BaseAction {
    public title = 'Play this unit';

    public constructor(card: Card) {
        super(card, [payAdjustableResourceCost()]);
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
            !context.player.checkRestrictions('playUnit', context) ||
            !context.player.checkRestrictions('enterPlay', context)
        ) {
            return 'restriction';
        }
        return super.meetsRequirements(context);
    }

    override createContext(player: RelativePlayer = this.card.controller) {
        const context = super.createContext(player);
        context.costAspects = this.card.aspects;
        return context;
    }

    public override executeHandler(context: ExecutionContext): void {
        const cardPlayedEvent = context.game.getEvent(EventName.OnCardPlayed, {
            player: context.player,
            card: context.source,
            context: context,
            originalLocation: context.source.location,
            originallyOnTopOfDeck:
                context.player && context.player.deck && context.player.deck.first() === context.source,
            onPlayCardSource: context.onPlayCardSource,
            playType: PlayType.PlayFromHand
        });

        context.game.addMessage(
            '{0} plays {1}',
            context.player,
            context.source,
        );
        const effect = context.source.getEffects(EffectName.EntersPlayForOpponent);
        const player = effect.length > 0 ? RelativePlayer.Opponent : RelativePlayer.Self;
        context.game.openEventWindow([
            putIntoPlay({
                controller: player,
                overrideLocation: Location.Hand        // TODO: should we be doing this?
            }).getEvent(context.source, context),
            cardPlayedEvent
        ]);
    }

    public override isCardPlayed(): boolean {
        return true;
    }
}
