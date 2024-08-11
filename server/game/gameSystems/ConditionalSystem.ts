import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Event } from '../core/event/Event';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';

export interface IConditionalSystemProperties extends IGameSystemProperties {
    condition: ((context: AbilityContext, properties: IConditionalSystemProperties) => boolean) | boolean;
    trueGameAction: GameSystem;
    falseGameAction: GameSystem;
}

export class ConditionalSystem extends GameSystem<IConditionalSystemProperties> {
    override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): IConditionalSystemProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        properties.trueGameAction.setDefaultTargetFn(() => properties.target);
        properties.falseGameAction.setDefaultTargetFn(() => properties.target);
        return properties;
    }

    getGameAction(context: AbilityContext, additionalProperties = {}): GameSystem {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        let condition = properties.condition;
        if (typeof condition === 'function') {
            condition = condition(context, properties);
        }
        return condition ? properties.trueGameAction : properties.falseGameAction;
    }

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        return this.getGameAction(context).getEffectMessage(context);
    }

    override canAffect(target: any, context: AbilityContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).canAffect(target, context, additionalProperties);
    }

    override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasLegalTarget(context, additionalProperties);
    }

    // UP NEXT: should there be two different types of GameSystem? ones that have handlers and ones that add to array?
    override addEventsToArray(events: Event[], context: AbilityContext, additionalProperties = {}): void {
        this.getGameAction(context, additionalProperties).addEventsToArray(events, context, additionalProperties);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    eventHandler(target) {}

    override hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasTargetsChosenByInitiatingPlayer(
            context,
            additionalProperties
        );
    }
}