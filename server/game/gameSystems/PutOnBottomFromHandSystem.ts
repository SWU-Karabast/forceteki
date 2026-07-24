import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { DeckZoneDestination, EventName, RelativePlayer, TargetMode, ZoneName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import type { Card } from '../core/card/Card.js';
import * as CardSelectorFactory from '../core/cardSelector/CardSelectorFactory.js';
import { SelectCardMode } from '../core/gameSteps/PromptInterfaces.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPutOnBottomFromHandProperties extends IPlayerTargetSystemProperties {}

/**
 * Prompts the target player to choose a card from their hand and put it on the
 * bottom of their deck. Used as a contingent event of {@link ClaimPlanCounterSystem}.
 * If the player's hand is empty the prompt is skipped.
 */
export class PutOnBottomFromHandSystem<TContext extends AbilityContext = AbilityContext>
    extends PlayerTargetSystem<TContext, IPutOnBottomFromHandProperties> {
    public override readonly name = 'putOnBottomFromHand';
    public override readonly eventName = EventName.OnPlanCounterPutOnBottom;

    public override defaultTargets(context: TContext): Player[] {
        return context.player ? [context.player] : [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        const player = event.player as Player;
        const game = event.context.game;

        if (player.hand.length === 0) {
            return;
        }

        const selector = CardSelectorFactory.create({
            mode: TargetMode.Single,
            zoneFilter: ZoneName.Hand,
            controller: RelativePlayer.Self,
        });

        game.promptForSelect(player, {
            activePromptTitle: 'Choose a card from your hand to put on the bottom of your deck',
            // eslint-disable-next-line forceteki/no-raw-token-text -- "Plan" refers to the TwinSuns Plan counter, not the Plan trait
            source: 'Plan Counter',
            selector,
            isOpponentEffect: false,
            selectCardMode: SelectCardMode.Single,
            onSelect: (card: Card | Card[]) => {
                const target = Array.isArray(card) ? card[0] : card;
                target.moveTo(DeckZoneDestination.DeckBottom);
                return true;
            },
        });
    }
}
