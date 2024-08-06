import type { AbilityContext } from '../AbilityContext';
import DrawCard from '../drawcard';
import { GameAction, type GameActionProperties } from './GameAction';

export interface HandlerProperties extends GameActionProperties {
    handler: (context: AbilityContext) => void;
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

export class HandlerAction extends GameAction {
    defaultProperties: HandlerProperties = {
        handler: () => true,
        hasTargetsChosenByInitiatingPlayer: false
    };

    hasLegalTarget(): boolean {
        return true;
    }

    canAffect(card: DrawCard, context: AbilityContext): boolean {
        return true;
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        events.push(this.getEvent(null, context, additionalProperties));
    }

    eventHandler(event, additionalProperties = {}): void {
        const properties = this.getProperties(event.context, additionalProperties) as HandlerProperties;
        properties.handler(event.context);
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}) {
        const { hasTargetsChosenByInitiatingPlayer } = this.getProperties(
            context,
            additionalProperties
        ) as HandlerProperties;
        return hasTargetsChosenByInitiatingPlayer;
    }
}
