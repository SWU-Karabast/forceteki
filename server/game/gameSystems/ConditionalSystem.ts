import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Event } from '../core/event/Event';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';

export interface IConditionalSystemProperties extends IGameSystemProperties {
    condition: ((context: AbilityContext, properties: IConditionalSystemProperties) => boolean) | boolean;
    trueGameAction: GameSystem;
    falseGameAction: GameSystem;
}

/** @deprecated This was brought from L5R but has not yet been tested */
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

    override generateEventsForAllTargets(context: AbilityContext, additionalProperties = {}): Event[] {
        return this.getGameAction(context, additionalProperties).generateEventsForAllTargets(context, additionalProperties);
    }

    // UP NEXT: some GameSystem subclasses just generate events but don't themselves have eventHandlers, do we need to specialize for that case?
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    eventHandler(target) {}

    override hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasTargetsChosenByInitiatingPlayer(
            context,
            additionalProperties
        );
    }
}