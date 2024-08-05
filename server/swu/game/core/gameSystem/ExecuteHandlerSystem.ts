import type { AbilityContext } from '../../AbilityContext';
import { GameSystem, type GameSystemProperties } from './GameSystem';
import BaseCard from '../card/basecard';

export interface ExecuteHandlerSystemProperties extends GameSystemProperties {
    handler: (context: AbilityContext) => void;
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

// TODO: this is sometimes getting used as a no-op, see if we can add an explicit implementation for that
export class ExecuteHandlerSystem extends GameSystem {
    defaultProperties: ExecuteHandlerSystemProperties = {
        handler: () => true,
        hasTargetsChosenByInitiatingPlayer: false
    };

    hasLegalTarget(): boolean {
        return true;
    }

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        return true;
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        events.push(this.getEvent(null, context, additionalProperties));
    }

    eventHandler(event, additionalProperties = {}): void {
        const properties = this.getProperties(event.context, additionalProperties) as ExecuteHandlerSystemProperties;
        properties.handler(event.context);
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}) {
        const { hasTargetsChosenByInitiatingPlayer } = this.getProperties(
            context,
            additionalProperties
        ) as ExecuteHandlerSystemProperties;
        return hasTargetsChosenByInitiatingPlayer;
    }
}
