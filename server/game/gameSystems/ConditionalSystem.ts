import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';

// TODO: allow providing only onTrue or onFalse in the properties so we don't need to use noAction()
export interface IConditionalSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    condition: ((context: TContext, properties: IConditionalSystemProperties) => boolean) | boolean;
    onTrue: GameSystem<TContext>;
    onFalse: GameSystem<TContext>;
}

export class ConditionalSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, IConditionalSystemProperties<TContext>> {
    protected override readonly eventName = MetaEventName.Conditional;
    public override getInnerSystems(properties: IConditionalSystemProperties<TContext>) {
        return [properties.onTrue, properties.onFalse];
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        return this.getGameAction(context).getEffectMessage(context);
    }

    public override canAffect(target: any, context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return this.getGameAction(context, additionalProperties).canAffect(target, context, additionalProperties, mustChangeGameState);
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
}