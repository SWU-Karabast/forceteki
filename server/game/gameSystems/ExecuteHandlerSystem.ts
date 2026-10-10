import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { Card } from '../core/card/Card';
import type { GameEvent } from '../core/event/GameEvent';
import { MetaEventName } from '../core/Constants';
import type { GameObject } from '../core/GameObject';
import type { Player } from '../core/Player';

export interface IExecuteHandlerSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    handler: (context: TContext) => void;
    effectMessage?: (context: TContext) => [string, any[]];
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

/**
 * A {@link GameSystem} which executes a handler function, and can optionally emit a custom effect message.
 */
export class ExecuteHandlerSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IExecuteHandlerSystemProperties<TContext>> {
    public override readonly eventName = MetaEventName.ExecuteHandler;
    protected override readonly defaultProperties: IGameSystemInput<IExecuteHandlerSystemProperties> = {
        handler: () => true,
        effectMessage: undefined,
        hasTargetsChosenByInitiatingPlayer: false
    };

    protected override eventHandlerInternal(event, properties: IExecuteHandlerSystemProperties<TContext>): void {
        properties.handler(event.context);
    }

    protected override getEffectMessageInternal(context: TContext, properties: IExecuteHandlerSystemProperties<TContext>): [string, any[]] {
        const { effectMessage } = properties;
        if (effectMessage) {
            return effectMessage(context);
        }
        return super.getEffectMessageInternal(context, properties);
    }

    protected override hasLegalTargetInternal(context: TContext, properties: IExecuteHandlerSystemProperties<TContext>): boolean {
        return true;
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IExecuteHandlerSystemProperties<TContext>): boolean {
        return true;
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IExecuteHandlerSystemProperties<TContext>, additionalProperties: Partial<IGameSystemInput<IExecuteHandlerSystemProperties<TContext>>> = {}): void {
        events.push(this.generateEvent(context, additionalProperties));
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IGameSystemInput<IExecuteHandlerSystemProperties<TContext>>> = {}) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const { hasTargetsChosenByInitiatingPlayer } = properties;
        return hasTargetsChosenByInitiatingPlayer ? player === context.player : false;
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }
}
