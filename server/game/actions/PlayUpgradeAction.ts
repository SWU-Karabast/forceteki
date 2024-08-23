import { AbilityContext } from '../core/ability/AbilityContext';
import PlayerAction from '../core/ability/PlayerAction';
import { Card } from '../core/card/Card';
import { AbilityRestriction, EventName, Location, PhaseName, PlayType } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { payAdjustableResourceCost } from '../costs/CostLibrary';
import { attachUpgrade } from '../gameSystems/GameSystemLibrary';

type ExecutionContext = AbilityContext & { onPlayCardSource: any };

export class PlayUpgradeAction extends PlayerAction {
    // we pass in a targetResolver holding the attachUpgrade system so that the action will be blocked if there are no valid targets
    public constructor(card: Card) {
        super(card, 'Play this upgrade', [payAdjustableResourceCost()], { immediateEffect: attachUpgrade((context) => ({
            upgrade: context.source
        })) });
    }

    public override executeHandler(context: ExecutionContext) {
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
        context.game.openEventWindow([
            context.game.actions
                .attachUpgrade({ upgrade: context.source, takeControl: context.source.controller !== context.player })
                .generateEvent(context.target, context),
            cardPlayedEvent
        ]);
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

    public override displayMessage(context: AbilityContext) {
        context.game.addMessage('{0} plays {1}, attaching it to {2}', context.player, context.source, context.target);
    }

    public override isCardPlayed() {
        return true;
    }
}
