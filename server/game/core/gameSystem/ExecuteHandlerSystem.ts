import type { AbilityContext } from '../ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from './GameSystem';
import Card from '../card/Card';

export interface IExecuteHandlerSystemProperties extends IGameSystemProperties {
    handler: (context: AbilityContext) => void;
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

// TODO: this is sometimes getting used as a no-op, see if we can add an explicit implementation for that
export class ExecuteHandlerSystem extends GameSystem {
    defaultProperties: IExecuteHandlerSystemProperties = {
        handler: () => true,
        hasTargetsChosenByInitiatingPlayer: false
    };

    hasLegalTarget(): boolean {
        return true;
    }

    canAffect(card: Card, context: AbilityContext): boolean {
        return true;
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        events.push(this.getEvent(null, context, additionalProperties));
    }

    eventHandler(event, additionalProperties = {}): void {
        const properties = this.getProperties(event.context, additionalProperties) as IExecuteHandlerSystemProperties;
        properties.handler(event.context);
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}) {
        const { hasTargetsChosenByInitiatingPlayer } = this.getProperties(
            context,
            additionalProperties
        ) as IExecuteHandlerSystemProperties;
        return hasTargetsChosenByInitiatingPlayer;
    }
}
