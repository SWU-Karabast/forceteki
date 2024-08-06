import { GameAction, type GameActionProperties } from './GameAction';
import type { GameObject } from '../GameObject';
import type { AbilityContext } from '../AbilityContext';

export interface SequentialContextProperties extends GameActionProperties {
    gameActions: GameAction[];
}

export class SequentialContextAction extends GameAction {
    defaultProperties: SequentialContextProperties;

    getEffectMessage(context: AbilityContext): [string, any] {
        let properties = super.getProperties(context) as SequentialContextProperties;
        return properties.gameActions[0].getEffectMessage(context);
    }

    getProperties(context: AbilityContext, additionalProperties = {}): SequentialContextProperties {
        let properties = super.getProperties(context, additionalProperties) as SequentialContextProperties;
        for (const gameAction of properties.gameActions) {
            gameAction.setDefaultTarget(() => properties.target);
        }
        return properties;
    }

    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        let { gameActions } = this.getProperties(context, additionalProperties);
        return gameActions.some((gameAction) => gameAction.hasLegalTarget(context));
    }

    canAffect(target: GameObject, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties);
        return properties.gameActions.some((gameAction) => gameAction.canAffect(target, context));
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        let properties = this.getProperties(context, additionalProperties);
        for (const gameAction of properties.gameActions) {
            context.game.queueSimpleStep(() => {
                if (gameAction.hasLegalTarget(context, additionalProperties)) {
                    let eventsForThisAction = [];
                    gameAction.addEventsToArray(eventsForThisAction, context, additionalProperties);
                    context.game.queueSimpleStep(() => {
                        for (const event of eventsForThisAction) {
                            events.push(event);
                        }
                        if (gameAction !== properties.gameActions[properties.gameActions.length - 1]) {
                            context.game.openThenEventWindow(eventsForThisAction);
                        }
                    });
                }
            });
        }
    }

    hasTargetsChosenByInitiatingPlayer(context, additionalProperties = {}) {
        let properties = this.getProperties(context, additionalProperties);
        return properties.gameActions.some((gameAction) =>
            gameAction.hasTargetsChosenByInitiatingPlayer(context, additionalProperties)
        );
    }
}
