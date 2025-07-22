import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import { NoActionSystem } from './NoActionSystem';
import * as Contract from '../core/utils/Contract';
import type { Player } from '../core/Player';
import { StaticAbilityHelper } from '../AbilityHelper';

// TODO: allow providing only onTrue or onFalse in the properties so we don't need to use noAction()
export interface IConditionalSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    condition: ((context: TContext, properties: IConditionalSystemProperties) => boolean) | boolean;
    onTrue?: GameSystem<TContext>;
    onFalse?: GameSystem<TContext>;
}

export class ConditionalSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, IConditionalSystemProperties<TContext>> {
    public override readonly eventName = MetaEventName.Conditional;

    protected override readonly defaultProperties: IConditionalSystemProperties<TContext>;

    public constructor(propertiesOrPropertyFactory: IConditionalSystemProperties<TContext> | ((context?: TContext) => IConditionalSystemProperties<TContext>)) {
        super(propertiesOrPropertyFactory);

        this.defaultProperties = {
            condition: null,
            onTrue: StaticAbilityHelper.immediateEffects.noAction(),
            onFalse: StaticAbilityHelper.immediateEffects.noAction(),
        };
    }

    public override getInnerSystems(properties: IConditionalSystemProperties<TContext>) {
        return [properties.onTrue, properties.onFalse];
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        return this.getGameAction(context).getEffectMessage(context);
    }

    public override canAffectInternal(target: any, context: TContext, additionalProperties: Partial<IConditionalSystemProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return this.getGameAction(context, additionalProperties).canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IConditionalSystemProperties<TContext>> = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasLegalTarget(context, additionalProperties);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IConditionalSystemProperties<TContext>> = {}): void {
        this.getGameAction(context, additionalProperties).queueGenerateEventGameSteps(events, context, additionalProperties);
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IConditionalSystemProperties<TContext>> = {}): boolean {
        return this.getGameAction(context, additionalProperties).hasTargetsChosenByPlayer(
            context,
            player,
            additionalProperties
        );
    }

    private getGameAction(context: TContext, additionalProperties: Partial<IConditionalSystemProperties<TContext>> = {}) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        let condition = properties.condition;
        if (typeof condition === 'function') {
            condition = condition(context, properties);
        }
        return condition ? properties.onTrue : properties.onFalse;
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<IConditionalSystemProperties<TContext>> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        Contract.assertFalse(properties.onTrue instanceof NoActionSystem && properties.onFalse instanceof NoActionSystem, 'You must provide onTrue or onFalse for ConditionalSystem');

        return properties;
    }
}
