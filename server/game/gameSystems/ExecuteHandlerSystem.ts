import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { Card } from '../core/card/Card';
import { GameEvent } from '../core/event/GameEvent';

export interface IExecuteHandlerSystemProperties extends IGameSystemProperties {
    handler: (context: AbilityContext) => void;
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

// TODO: this is sometimes getting used as a no-op, see if we can add an explicit implementation for that
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

    public override generateEventsForAllTargets(context: AbilityContext, additionalProperties = {}): GameEvent[] {
        return [this.generateEvent(null, context, additionalProperties)];
    }

    public override hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}) {
        const { hasTargetsChosenByInitiatingPlayer } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IExecuteHandlerSystemProperties;
        return hasTargetsChosenByInitiatingPlayer;
    }
}
