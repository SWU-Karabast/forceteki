import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { MetaEventName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IWinGameProperties extends IPlayerTargetSystemProperties { }

export class WinGameSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IWinGameProperties> {
    public override readonly name = 'winGame';
    public override readonly eventName = MetaEventName.GameWon;
    public override readonly effectDescription = 'win the game';

    public eventHandler(event: any): void {
        const context = event.context;
        const properties = this.generatePropertiesFromContext(context);

        context.game.endGame(properties.target, event.endGameReason);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Partial<IWinGameProperties> = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.endGameReason = context.source.title;
    }
}
