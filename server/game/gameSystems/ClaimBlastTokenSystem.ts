import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { DamageType, EventName } from '../core/Constants.js';
import { TriggerHandlingMode } from '../core/event/EventWindow.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import { DamageSystem } from './DamageSystem.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IClaimBlastTokenProperties extends IPlayerTargetSystemProperties {}

export class ClaimBlastTokenSystem<TContext extends AbilityContext = AbilityContext>
    extends PlayerTargetSystem<TContext, IClaimBlastTokenProperties> {
    public override readonly name = 'claimBlastToken';
    public override readonly eventName = EventName.OnBlastTokenClaimed;

    // TSTODO: damage all opponents' bases
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        new DamageSystem({ type: DamageType.Ability, amount: 1 })
            .resolve(event.player.opponent.base, event.context, TriggerHandlingMode.ResolvesTriggers);
    }
}
