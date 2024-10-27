import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { Card } from '../core/card/Card';
import { GameEvent } from '../core/event/GameEvent';
import { MetaEventName } from '../core/Constants';

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

    public eventHandler(event, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties) as IExecuteHandlerSystemProperties;
        properties.handler(event.context);
    }

    public override hasLegalTarget(): boolean {
        return true;
    }

    public override canAffect(card: Card, context: TContext): boolean {
        return true;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        events.push(this.generateEvent(null, context, additionalProperties));
    }

    public override hasTargetsChosenByInitiatingPlayer(context: TContext, additionalProperties = {}) {
        const { hasTargetsChosenByInitiatingPlayer } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IExecuteHandlerSystemProperties;
        return hasTargetsChosenByInitiatingPlayer;
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}
