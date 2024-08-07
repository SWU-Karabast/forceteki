import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from '../core/gameSystem/GameSystem';
import Card from '../core/card/Card';

export interface IExecuteHandlerSystemProperties extends IGameSystemProperties {
    handler: (context: AbilityContext) => void;
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

// TODO: this is sometimes getting used as a no-op, see if we can add an explicit implementation for that
/**
 * A {@link GameSystem} which executes a handler function
 */
export class ExecuteHandlerSystem extends GameSystem {
    override defaultProperties: IExecuteHandlerSystemProperties = {
        handler: () => true,
        hasTargetsChosenByInitiatingPlayer: false
    };

    override hasLegalTarget(): boolean {
        return true;
    }

    override canAffect(card: Card, context: AbilityContext): boolean {
        return true;
    }

    override addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        events.push(this.getEvent(null, context, additionalProperties));
    }

    eventHandler(event, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties) as IExecuteHandlerSystemProperties;
        properties.handler(event.context);
    }

    override hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}) {
        const { hasTargetsChosenByInitiatingPlayer } = this.generatePropertiesFromContext(
            context,
            additionalProperties
        ) as IExecuteHandlerSystemProperties;
        return hasTargetsChosenByInitiatingPlayer;
    }
}
