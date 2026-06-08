import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { EventName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import { DrawSystem } from './DrawSystem.js';
import { PutOnBottomFromHandSystem } from './PutOnBottomFromHandSystem.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IClaimPlanTokenProperties extends IPlayerTargetSystemProperties {}

export class ClaimPlanTokenSystem<TContext extends AbilityContext = AbilityContext>
    extends PlayerTargetSystem<TContext, IClaimPlanTokenProperties> {
    public override readonly name = 'claimPlanToken';
    public override readonly eventName = EventName.OnPlanTokenClaimed;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        const player = event.player as Player;
        const game = event.context.game;

        game.isPlanTokenClaimed = true;
        player.passedActionPhase = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected override updateEvent(event: any, player: Player, context: TContext, additionalProperties: Partial<IClaimPlanTokenProperties>): void {
        super.updateEvent(event, player, context, additionalProperties);

        // The draw fires first as a contingent of OnPlanTokenClaimed, then the put-on-bottom
        // prompt fires as a subsequent contingent — ensuring the player sees their drawn card
        // before deciding which card to return to the bottom of their deck.
        event.setContingentEventsGenerator(() => [
            new DrawSystem({ amount: 1 }).generateRetargetedEvent(player, context),
            new PutOnBottomFromHandSystem({}).generateRetargetedEvent(player, context),
        ]);
    }
}
