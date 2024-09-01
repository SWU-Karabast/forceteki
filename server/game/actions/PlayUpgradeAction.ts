import { AbilityContext } from '../core/ability/AbilityContext';
import { PlayCardContext, PlayCardAction } from '../core/ability/PlayCardAction';
import { Card } from '../core/card/Card';
import { AbilityRestriction, EventName, Location, PhaseName, PlayType, RelativePlayer } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { payResourceCost } from '../costs/CostLibrary';
import { attachUpgrade } from '../gameSystems/GameSystemLibrary';

export class PlayUpgradeAction extends PlayCardAction {
    // we pass in a targetResolver holding the attachUpgrade system so that the action will be blocked if there are no valid targets
    public constructor(card: Card) {
        super(card, 'Play this upgrade', [], { immediateEffect: attachUpgrade((context) => ({
            upgrade: context.source
        })) });
    }

    public override executeHandler(context: PlayCardContext) {
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
            context.player.hasRestriction(AbilityRestriction.PlayUpgrade, context) ||
            context.player.hasRestriction(AbilityRestriction.PutIntoPlay, context)
        ) {
            return 'restriction';
        }
        return super.meetsRequirements(context);
    }

    public override displayMessage(context: AbilityContext) {
        context.game.addMessage('{0} plays {1}, attaching it to {2}', context.player, context.source, context.target);
    }
}
