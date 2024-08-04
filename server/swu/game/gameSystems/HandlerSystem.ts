import type { AbilityContext } from '../AbilityContext';
import { GameSystem, type GameSystemProperties } from './GameSystem';
import BaseCard from '../core/card/basecard';

export interface HandlerProperties extends GameSystemProperties {
    handler: (context: AbilityContext) => void;
    hasTargetsChosenByInitiatingPlayer?: boolean;
}

export class HandlerAction extends GameSystem {
    defaultProperties: HandlerProperties = {
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
