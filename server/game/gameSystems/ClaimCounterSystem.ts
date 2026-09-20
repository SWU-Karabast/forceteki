import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { ClaimCounterType, DamageType, EventName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import { Contract } from '../core/utils/Contract.js';
import { DamageSystem } from './DamageSystem.js';
import { DrawSystem } from './DrawSystem.js';
import { ClaimPlanCounterPutOnBottomSystem } from './ClaimPlanCounterPutOnBottomSystem.js';

export interface IClaimCounterProperties extends IPlayerTargetSystemProperties {
    counterType: ClaimCounterType;
}

const eventNameByCounterType: Record<ClaimCounterType, EventName> = {
    [ClaimCounterType.Initiative]: EventName.OnClaimInitiative,
    [ClaimCounterType.Plan]: EventName.OnPlanCounterClaimed,
    [ClaimCounterType.Blast]: EventName.OnBlastCounterClaimed,
};

/** Handles claiming any of the three action-phase claim counters (Initiative, Plan, Blast). */
export class ClaimCounterSystem<TContext extends AbilityContext = AbilityContext>
    extends PlayerTargetSystem<TContext, IClaimCounterProperties> {
    public override readonly name = 'claimCounter';

    public override get eventName(): EventName {
        Contract.assertNotNullLike(this.properties?.counterType, 'ClaimCounterSystem requires a counterType property');
        return eventNameByCounterType[this.properties.counterType];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        const player = event.player as Player;
        const game = event.context.game;

        switch (event.counterType as ClaimCounterType) {
            case ClaimCounterType.Initiative:
                game.initiativePlayer = player;
                game.isInitiativeClaimed = true;
                break;
            case ClaimCounterType.Plan:
                game.isPlanCounterClaimed = true;
                break;
            case ClaimCounterType.Blast:
                game.isBlastCounterClaimed = true;
                break;
        }

        // NOTE ON ORDERING: this handler runs when the queued event window opens, not synchronously when
        // resolve() is called (see Game.claimCounter). ActionWindow.claim*() calls Game.claimCounter(...)
        // and then immediately calls pass(false), which — via Game.rotateActivePlayer() — reads this same
        // player.passedActionPhase flag. That read only sees the value set here because GamePipeline drains
        // steps queued during the current step (including this event window) before the pipeline advances
        // past the ActionWindow's own completion. This isn't independently enforced or unit-tested at the
        // pipeline level — if that step-ordering ever changes, this flag could be read stale.
        player.passedActionPhase = true;
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Partial<IClaimCounterProperties> = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        event.counterType = properties.counterType;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected override updateEvent(event: any, player: Player, context: TContext, additionalProperties: Partial<IClaimCounterProperties>): void {
        super.updateEvent(event, player, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        switch (properties.counterType) {
            case ClaimCounterType.Plan:
                // The draw fires first as a contingent of OnPlanCounterClaimed, then the put-on-bottom
                // prompt fires as a subsequent contingent — ensuring the player sees their drawn card
                // before deciding which card to return to the bottom of their deck. Both must stay as
                // contingents (rather than independent top-level resolves) so this event window's own
                // triggered-ability resolution — e.g. Rey/Seasoned Fleet Admiral's "a card was drawn"
                // triggers — happens after the put-on-bottom prompt, not before it.
                event.setContingentEventsGenerator(() => [
                    new DrawSystem({ amount: 1 }).generateRetargetedEvent(player, context),
                    new ClaimPlanCounterPutOnBottomSystem({}).generateRetargetedEvent(player, context),
                ]);
                break;
            case ClaimCounterType.Blast:
                // TSTODO: damage all opponents' bases
                // The base damage fires as a contingent of OnBlastCounterClaimed, so prevention effects
                // (e.g. Close the Shield Gate) and triggers (e.g. Boba Fett) see it as a distinct damage event.
                event.setContingentEventsGenerator(() => [
                    new DamageSystem({ type: DamageType.Ability, amount: 1 }).generateRetargetedEvent(player.opponent.base, context),
                ]);
                break;
            case ClaimCounterType.Initiative:
                // No contingent events.
                break;
        }
    }
}
