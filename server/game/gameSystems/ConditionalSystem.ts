import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameEvent } from '../core/event/GameEvent';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';

export interface IConditionalSystemProperties extends IGameSystemProperties {
    condition: ((context: AbilityContext, properties: IConditionalSystemProperties) => boolean) | boolean;
    trueGameAction: GameSystem;
    falseGameAction: GameSystem;
}

/** @deprecated This was brought from L5R but has not yet been tested */
export class ConditionalSystem extends GameSystem<IConditionalSystemProperties> {
    public override generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): IConditionalSystemProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        properties.trueGameAction.setDefaultTargetFn(() => properties.target);
        properties.falseGameAction.setDefaultTargetFn(() => properties.target);
        return properties;
    }

    // TODO: some GameSystem subclasses just generate events but don't themselves have eventHandlers, do we need to specialize for that case?
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(target) {}

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        return this.getGameAction(context).getEffectMessage(context);
    }

    public override canAffect(target: any, context: AbilityContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).canAffect(target, context, additionalProperties);
    }

    public override hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasLegalTarget(context, additionalProperties);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: AbilityContext, additionalProperties = {}): void {
        this.getGameAction(context, additionalProperties).queueGenerateEventGameSteps(events, context, additionalProperties);
    }

    public override hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasTargetsChosenByInitiatingPlayer(
            context,
            additionalProperties
        );
    }

    private getGameAction(context: AbilityContext, additionalProperties = {}): GameSystem {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        let condition = properties.condition;
        if (typeof condition === 'function') {
            condition = condition(context, properties);
        }
        return condition ? properties.trueGameAction : properties.falseGameAction;
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}