import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { DeckZoneDestination, EventName, RelativePlayer, SwuGameFormat, TargetMode, ZoneName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import type { Card } from '../core/card/Card.js';
import * as CardSelectorFactory from '../core/cardSelector/CardSelectorFactory.js';
import { SelectCardMode } from '../core/gameSteps/PromptInterfaces.js';
import { MoveCardSystem } from './MoveCardSystem.js';
import type { GameEvent } from '../core/event/GameEvent.js';
import { Contract } from '../core/utils/Contract.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IClaimPlanCounterPutOnBottomProperties extends IPlayerTargetSystemProperties {}

/**
 * Prompts the target player to choose a card from their hand and put it on the
 * bottom of their deck. Used as a contingent event of {@link ClaimCounterSystem}'s
 * Plan counter branch. If the player's hand is empty the prompt is skipped.
 *
 * Must remain a contingent event of the claim (rather than an independent top-level resolve, e.g. via
 * selectCard()) so that this prompt resolves before that claim event window's own triggered-ability
 * window opens — see SeasonedFleetAdmiral.spec.ts / ReyWithPalpatinesPower.spec.ts, which assert that
 * the put-on-bottom choice happens before any "a card was drawn" triggers fire.
 */
export class ClaimPlanCounterPutOnBottomSystem<TContext extends AbilityContext = AbilityContext>
    extends PlayerTargetSystem<TContext, IClaimPlanCounterPutOnBottomProperties> {
    public override readonly name = 'claimPlanCounterPutOnBottom';
    public override readonly eventName = EventName.OnPlanCounterPutOnBottom;

    public override defaultTargets(context: TContext): Player[] {
        return context.player ? [context.player] : [];
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IClaimPlanCounterPutOnBottomProperties> = {}): void {
        Contract.assertTrue(context.game.format === SwuGameFormat.FauxSuns, `${this.name} should only be created in the FauxSuns format, but this game's format is ${context.game.format}`);
        super.queueGenerateEventGameSteps(events, context, additionalProperties);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        const player = event.player as Player;
        const game = event.context.game;
        const context = event.context;

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
                new MoveCardSystem({ target, destination: DeckZoneDestination.DeckBottom }).resolve(undefined, context);
                return true;
            },
        });
    }
}
