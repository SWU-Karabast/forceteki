import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { Card } from '../core/card/Card';
import { GameEvent } from '../core/event/GameEvent';

export interface IExecuteHandlerSystemProperties extends IGameSystemProperties {
    handler: (context: AbilityContext) => void;
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

/**
 * A {@link GameSystem} which executes a handler function
 * @override This was copied from L5R but has not been tested yet
 */
export class ExecuteHandlerSystem extends GameSystem {
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

    public override canAffect(card: Card, context: AbilityContext): boolean {
        return true;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: AbilityContext, additionalProperties = {}): void {
        events.push(this.generateEvent(null, context, additionalProperties));
    }

    public override hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}) {
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
