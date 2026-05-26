import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { DamageType, DeckZoneDestination, EventName, RelativePlayer, TargetMode, ZoneName } from '../core/Constants.js';
import { TriggerHandlingMode } from '../core/event/EventWindow.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import type { Card } from '../core/card/Card.js';
import * as CardSelectorFactory from '../core/cardSelector/CardSelectorFactory.js';
import { SelectCardMode } from '../core/gameSteps/PromptInterfaces.js';
import { DamageSystem } from './DamageSystem.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IClaimPlanTokenProperties extends IPlayerTargetSystemProperties {}

export class ClaimPlanTokenSystem<TContext extends AbilityContext = AbilityContext>
    extends PlayerTargetSystem<TContext, IClaimPlanTokenProperties> {
    public override readonly name = 'claimPlanToken';
    public override readonly eventName = EventName.OnPlanTokenClaimed;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        const player = event.player as Player;
        const context = event.context;
        const game = context.game;

        // Capture which cards are about to be drawn so we can reference them in the
        // OnCardsDrawn event that fires after the put-to-bottom prompt.
        const cardsBeingDrawn = player.drawDeck.slice(0, 1);

        // Draw 1 card into hand — we'll fire the draw event later
        player.drawCardsToHand(1);

        // If the deck was empty (or too small), deal 3 damage per missed draw to the player's own base.
        const cannotDrawCount = 1 - cardsBeingDrawn.length;
        if (cannotDrawCount > 0) {
            new DamageSystem({ type: DamageType.Ability, amount: 3 * cannotDrawCount })
                .resolve(player.base, context, TriggerHandlingMode.CannotHaveTriggers);
        }

        if (player.hand.length > 0) {
            const selector = CardSelectorFactory.create({
                mode: TargetMode.Single,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
            });

            game.promptForSelect(player, {
                activePromptTitle: 'Choose a card from your hand to put on the bottom of your deck',
                source: 'Plan Token',
                selector,
                isOpponentEffect: false,
                selectCardMode: SelectCardMode.Single,
                onSelect: (card: Card | Card[]) => {
                    const target = Array.isArray(card) ? card[0] : card;

                    // Move the card directly to the bottom of the deck (synchronous, same pattern as drawCardsToHand).
                    // Using MoveCardSystem.resolve() would queue the move into the event pipeline, but the event
                    // window for it can't be guaranteed to execute before the pipeline moves on after onSelect.
                    target.moveTo(DeckZoneDestination.DeckBottom);

                    // Fire OnCardsDrawn after the full Plan effect has resolved so that
                    // triggered abilities (Rey, Seasoned Fleet Admiral, etc.) respond
                    // in the correct order.
                    if (cardsBeingDrawn.length > 0) {
                        game.createEventAndOpenWindow(
                            EventName.OnCardsDrawn,
                            context,
                            { player, amount: cardsBeingDrawn.length, cards: cardsBeingDrawn },
                            TriggerHandlingMode.ResolvesTriggers
                        );
                    }

                    return true;
                },
            });
        }
    }
}
