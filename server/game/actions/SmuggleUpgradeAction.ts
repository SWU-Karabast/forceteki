import { AbilityContext } from '../core/ability/AbilityContext';
import { PlayCardContext } from '../core/ability/PlayCardAction';
import { PlayCardFromHandAction } from '../core/ability/PlayCardFromHandAction';
import { Card } from '../core/card/Card';
import type { UpgradeCard } from '../core/card/UpgradeCard';
import { AbilityRestriction, EventName } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { attachUpgrade, resourceCard } from '../gameSystems/GameSystemLibrary';
import * as Contract from '../core/utils/Contract.js';

export class SmuggleUpgradeAction extends PlayCardFromHandAction {
    // we pass in a targetResolver holding the attachUpgrade system so that the action will be blocked if there are no valid targets
    public constructor(card: Card) {
        super(card, 'Smuggle this upgrade', [], { immediateEffect: attachUpgrade<AbilityContext<UpgradeCard>>((context) => ({
            upgrade: context.source
        })) });
    }

    public override executeHandler(context: PlayCardContext) {
        Contract.assertTrue(context.source.isUpgrade());

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
            cardPlayedEvent,
            resourceCard({
                target: context.player.getTopCardOfDeck()
            }).generateEvent(context.source, context)
        ], this.resolveTriggersAfter);
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
