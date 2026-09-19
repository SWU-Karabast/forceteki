import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { EventName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IClaimInitiativeProperties extends IPlayerTargetSystemProperties {}

export class ClaimInitiativeSystem<TContext extends AbilityContext = AbilityContext>
    extends PlayerTargetSystem<TContext, IClaimInitiativeProperties> {
    public override readonly name = 'claimInitiative';
    public override readonly eventName = EventName.OnClaimInitiative;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override eventHandler(event: any): void {
        const player = event.player as Player;
        const game = event.context.game;

        game.initiativePlayer = player;
        game.isInitiativeClaimed = true;
        player.passedActionPhase = true;

        // Update game state for the sake of constant abilities that check initiative.
        game.resolveGameState();
    }
}
