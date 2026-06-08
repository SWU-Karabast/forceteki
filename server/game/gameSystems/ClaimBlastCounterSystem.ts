import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { DamageType, EventName } from '../core/Constants.js';
import { TriggerHandlingMode } from '../core/event/EventWindow.js';
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

    // TSTODO: damage all opponents' bases
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        const player = event.player as Player;
        const game = event.context.game;

        game.isBlastCounterClaimed = true;
        player.passedActionPhase = true;

        new DamageSystem({ type: DamageType.Ability, amount: 1 })
            .resolve(player.opponent.base, event.context, TriggerHandlingMode.ResolvesTriggers);
    }
}
