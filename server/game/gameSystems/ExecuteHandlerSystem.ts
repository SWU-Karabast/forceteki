import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { Card } from '../core/card/Card';
import type { GameEvent } from '../core/event/GameEvent';
import { MetaEventName } from '../core/Constants';
import type { GameObject } from '../core/GameObject';
import type { Player } from '../core/Player';

export interface IExecuteHandlerSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    handler: (context: TContext) => void;
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

/**
 * A {@link GameSystem} which executes a handler function
 * @override This was copied from L5R but has not been tested yet
 */
export class ExecuteHandlerSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IExecuteHandlerSystemProperties<TContext>> {
    protected override readonly eventName = MetaEventName.ExecuteHandler;
    protected override readonly defaultProperties: IExecuteHandlerSystemProperties = {
        handler: () => true,
        hasTargetsChosenByInitiatingPlayer: false
    };

    public eventHandler(event, additionalProperties: Partial<IExecuteHandlerSystemProperties> = {}): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties) as IExecuteHandlerSystemProperties;
        properties.handler(event.context);
    }

    public override hasLegalTarget(): boolean {
        return true;
    }

    public override canAffectInternal(card: Card, context: TContext): boolean {
        return true;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IExecuteHandlerSystemProperties> = {}): void {
        events.push(this.generateEvent(context, additionalProperties));
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IExecuteHandlerSystemProperties> = {}) {
        const { hasTargetsChosenByInitiatingPlayer } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IExecuteHandlerSystemProperties;
        return hasTargetsChosenByInitiatingPlayer ? player === context.player : false;
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: GameObject): boolean {
        return false;
    }
}
