import type { AbilityContext } from '../AbilityContext';
import type Player from '../core/player';
import { GameSystem, type GameSystemProperties } from './GameSystem';

export interface PlayerSystemProperties extends GameSystemProperties {}

export class PlayerSystem<P extends PlayerSystemProperties = PlayerSystemProperties> extends GameSystem<P> {
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