import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameEvent } from '../core/event/GameEvent';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { MetaSystem } from '../core/gameSystem/MetaSystem';

export interface IConditionalSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    condition: ((context: TContext, properties: IConditionalSystemProperties) => boolean) | boolean;
    onTrue: GameSystem<TContext>;
    onFalse: GameSystem<TContext>;
}

export class ConditionalSystem<TContext extends AbilityContext = AbilityContext> extends MetaSystem<TContext, IConditionalSystemProperties<TContext>> {
    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        properties.onTrue.setDefaultTargetFn(() => properties.target);
        properties.onFalse.setDefaultTargetFn(() => properties.target);
        return properties;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        return this.getGameAction(context).getEffectMessage(context);
    }

    public override canAffect(target: any, context: TContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).canAffect(target, context, additionalProperties);
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasLegalTarget(context, additionalProperties);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        this.getGameAction(context, additionalProperties).queueGenerateEventGameSteps(events, context, additionalProperties);
    }

    public override hasTargetsChosenByInitiatingPlayer(context: TContext, additionalProperties = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasTargetsChosenByInitiatingPlayer(
            context,
            additionalProperties
        );
    }

    private getGameAction(context: TContext, additionalProperties = {}) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        let condition = properties.condition;
        if (typeof condition === 'function') {
            condition = condition(context, properties);
        }
        return condition ? properties.onTrue : properties.onFalse;
    }

    // TODO: refactor GameSystem so this class doesn't need to override this method (it isn't called since we override hasLegalTarget)
    protected override isTargetTypeValid(target: any): boolean {
        return false;
    }
}