import type { AbilityContext } from '../ability/AbilityContext';
import type Player from '../Player';
import { GameSystem, type IGameSystemProperties } from './GameSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPlayerTargetSystemProperties extends IGameSystemProperties {}

/**
 * A {@link GameSystem} which targets a player for its effect
 */
export abstract class PlayerTargetSystem<TProperties extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends GameSystem<TProperties> {
    public override readonly targetType = ['player'];

    public override defaultTargets(context: AbilityContext): Player[] {
        return context.player ? [context.player.opponent] : [];
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.player, event.context, additionalProperties);
    }

    public override addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.player = player;
    }
}
