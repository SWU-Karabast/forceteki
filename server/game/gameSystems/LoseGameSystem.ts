import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { MetaEventName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';

export interface ILoseGameProperties extends IPlayerTargetSystemProperties {
    target: Player;
}

export class LoseGameSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ILoseGameProperties> {
    public override readonly name = 'loseGame';
    public override readonly eventName = MetaEventName.GameLost;
    public override readonly effectDescription = '{0} lost the game';

    public eventHandler(event: any): void {
        const player = event.player as Player;
        player.game.endGame(player.opponent, event.endGameReason);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Partial<ILoseGameProperties> = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.endGameReason = context.source.title;
    }
}
