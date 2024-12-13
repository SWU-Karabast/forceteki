import type { AbilityContext } from '../ability/AbilityContext';
import { Card } from '../card/Card';
import { TriggerHandlingMode } from '../event/EventWindow';
import { GameEvent } from '../event/GameEvent';
import Player from '../Player';
import { GameSystem, type IGameSystemProperties } from './GameSystem';

export interface IPlayerTargetSystemProperties extends IGameSystemProperties {
    target?: Player | Player[];
}

/**
 * A {@link GameSystem} which targets a player for its effect
 */
export abstract class PlayerTargetSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends GameSystem<TContext, TProperties> {
    protected override isTargetTypeValid(target: any): boolean {
        return target instanceof Player;
    }

    public override defaultTargets(context: TContext): Player[] {
        return context.player ? [context.player.opponent] : [];
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.player, event.context, additionalProperties);
    }

    public override resolve(target: undefined | Player | Player[], context: TContext, triggerHandlingMode?: TriggerHandlingMode) {
        super.resolve(target, context, triggerHandlingMode);
    }

    protected override updateEvent(event: GameEvent, player: Player, context: TContext, additionalProperties?: any): void {
        super.updateEvent(event, player, context, additionalProperties);
    }

    protected override createEvent(player: Player, context: TContext, additionalProperties: any) {
        return super.createEvent(player, context, additionalProperties);
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.player = player;
    }
}
