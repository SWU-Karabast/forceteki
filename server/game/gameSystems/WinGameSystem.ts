import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { MetaEventName } from '../core/Constants.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';

export interface IWinGameProperties extends IPlayerTargetSystemProperties {
    winReason: string | ((context: AbilityContext) => string);
}

export class WinGameSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IWinGameProperties> {
    public override readonly name = 'winGame';
    public override readonly eventName = MetaEventName.GameWon;
    public override readonly effectDescription = 'win the game';

    public eventHandler(event: any): void {
        const context = event.context;

        this.emitGameWinMessage(context, event.player);
        context.game.endGame(event.player, event.endGameReason);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Partial<IWinGameProperties> = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.endGameReason = context.source.title;
    }

    private emitGameWinMessage(context: AbilityContext, player: Player) {
        const format = '{0} uses {1} to win the game {2}';

        if (typeof this.properties.winReason === 'function') {
            const message = this.properties.winReason(context);
            context.game.addMessage(format, player, context.source, message);
        } else {
            const message = this.properties.winReason;
            context.game.addMessage(format, player, context.source, message);
        }
    }
}
