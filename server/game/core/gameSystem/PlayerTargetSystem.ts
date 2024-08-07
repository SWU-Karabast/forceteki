import type { AbilityContext } from '../ability/AbilityContext';
import type Player from '../Player';
import { GameSystem, type IGameSystemProperties } from './GameSystem';

export interface IPlayerTargetSystemProperties extends IGameSystemProperties {}

/**
 * A {@link GameSystem} which targets a player for its effect
 */
export abstract class PlayerTargetSystem<P extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends GameSystem<P> {
    override targetType = ['player'];

    override defaultTargets(context: AbilityContext): Player[] {
        return context.player ? [context.player.opponent] : [];
    }

    override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.player, event.context, additionalProperties);
    }

    override addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.player = player;
    }
}