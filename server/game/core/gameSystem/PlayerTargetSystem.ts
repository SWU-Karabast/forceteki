import type { AbilityContext } from '../ability/AbilityContext';
import type { GameStateChangeRequired } from '../Constants';
import type { TriggerHandlingMode } from '../event/EventWindow';
import type { GameEvent } from '../event/GameEvent';
import type { GameObject } from '../GameObject';
import type Player from '../Player';
import * as Helpers from '../utils/Helpers';
import { GameSystem, type IGameSystemProperties } from './GameSystem';

export interface IPlayerTargetSystemProperties extends IGameSystemProperties {
    target?: Player | Player[];
}

/**
 * A {@link GameSystem} which targets a player for its effect
 */
export abstract class PlayerTargetSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends GameSystem<TContext, TProperties> {
    protected override isTargetTypeValid(target: GameObject | GameObject[]): boolean {
        const targetAra = Helpers.asArray(target);

        return targetAra.length > 0 && targetAra.every((targetItem) => targetItem.isPlayer());
    }

    public override defaultTargets(context: TContext): Player[] {
        return context.player ? [context.player.opponent] : [];
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.player, event.context, additionalProperties);
    }

    // override to force the argument type to be Player
    public override canAffect(target: Player | Player[], context: TContext, additionalProperties?: any, mustChangeGameState?: GameStateChangeRequired): boolean {
        return super.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    // override to force the argument type to be Player
    public override resolve(target: undefined | Player | Player[], context: TContext, triggerHandlingMode?: TriggerHandlingMode) {
        super.resolve(target, context, triggerHandlingMode);
    }

    // override to force the argument type to be Player
    protected override updateEvent(event: GameEvent, player: Player, context: TContext, additionalProperties?: any): void {
        super.updateEvent(event, player, context, additionalProperties);
    }

    // override to force the argument type to be Player
    protected override createEvent(player: Player, context: TContext, additionalProperties: any) {
        return super.createEvent(player, context, additionalProperties);
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.player = player;
    }
}
