import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { DeckZoneDestination, EventName, RelativePlayer, TargetMode, ZoneName } from '../core/Constants.js';
import { TriggerHandlingMode } from '../core/event/EventWindow.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import type { Card } from '../core/card/Card.js';
import * as CardSelectorFactory from '../core/cardSelector/CardSelectorFactory.js';
import { SelectCardMode } from '../core/gameSteps/PromptInterfaces.js';
import { DrawSystem } from './DrawSystem.js';

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

        // We use PassesTriggersToParentWindow so that triggered abilities (Rey, Seasoned Fleet Admiral, etc.)
        // are collected by the outer OnPlanTokenClaimed window and fire AFTER the put-on-bottom prompt —
        // i.e. the full Plan token effect resolves before any triggers respond.
        new DrawSystem({ amount: 1 }).resolve(player, context, TriggerHandlingMode.PassesTriggersToParentWindow);

        // Queue the put-on-bottom prompt as a simple step so it runs after the draw (and any
        // contingent empty-deck damage) has fully resolved.
        game.queueSimpleStep(() => {
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
                        target.moveTo(DeckZoneDestination.DeckBottom);
                        return true;
                    },
                });
            }
        }, 'plan token put on bottom');
    }
}
