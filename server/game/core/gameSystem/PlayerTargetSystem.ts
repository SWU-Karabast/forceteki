import type { AbilityContext } from '../ability/AbilityContext';
import Player from '../Player';
import { GameSystem, type IGameSystemProperties } from './GameSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPlayerTargetSystemProperties extends IGameSystemProperties {}

/**
 * A {@link GameSystem} which targets a player for its effect
 */
export abstract class PlayerTargetSystem<TProperties extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends GameSystem<TProperties> {
    protected override isTargetTypeValid(target: any): boolean {
        return target instanceof Player;
    }

    public override defaultTargets(context: AbilityContext): Player[] {
        return context.player ? [context.player.opponent] : [];
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.player, event.context, additionalProperties);
    }

    protected override addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.player = player;
    }
}
