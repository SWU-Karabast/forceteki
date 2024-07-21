import type { AbilityContext } from '../AbilityContext';
import type Player from '../player';
import { GameAction, type GameActionProperties } from './GameAction';

export interface PlayerActionProperties extends GameActionProperties {}

export class PlayerAction<P extends PlayerActionProperties = PlayerActionProperties> extends GameAction<P> {
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