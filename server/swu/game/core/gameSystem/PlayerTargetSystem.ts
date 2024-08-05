import type { AbilityContext } from '../ability/AbilityContext';
import type Player from '../Player';
import { GameSystem, type IGameSystemProperties } from './GameSystem';

export interface IPlayerTargetSystemProperties extends IGameSystemProperties {}

export class PlayerTargetSystem<P extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends GameSystem<P> {
    targetType = ['player'];

    defaultTargets(context: AbilityContext): Player[] {
        return context.player ? [context.player.opponent] : [];
    }

    checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.player, event.context, additionalProperties);
    }

    addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.player = player;
    }
}