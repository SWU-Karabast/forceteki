import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { DamageType, EventName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import { DamageSystem } from './DamageSystem.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IClaimBlastCounterProperties extends IPlayerTargetSystemProperties {}

export class ClaimBlastCounterSystem<TContext extends AbilityContext = AbilityContext>
    extends PlayerTargetSystem<TContext, IClaimBlastCounterProperties> {
    public override readonly name = 'claimBlastCounter';
    public override readonly eventName = EventName.OnBlastCounterClaimed;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        const player = event.player as Player;
        const game = event.context.game;

        game.isBlastCounterClaimed = true;
        player.passedActionPhase = true;
    }

    // TSTODO: damage all opponents' bases
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected override updateEvent(event: any, player: Player, context: TContext, additionalProperties: Partial<IClaimBlastCounterProperties>): void {
        super.updateEvent(event, player, context, additionalProperties);

        // The base damage fires as a contingent of OnBlastCounterClaimed, so prevention effects
        // (e.g. Close the Shield Gate) and triggers (e.g. Boba Fett) see it as a distinct damage event.
        event.setContingentEventsGenerator(() => [
            new DamageSystem({ type: DamageType.Ability, amount: 1 }).generateRetargetedEvent(player.opponent.base, context),
        ]);
    }
}
