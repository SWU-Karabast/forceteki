import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import { NoActionSystem } from './NoActionSystem';
import { Contract } from '../core/utils/Contract';
import type { Player } from '../core/Player';
import { StaticAbilityHelper } from '../AbilityHelper';

export interface IConditionalSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    condition: ((context: TContext, properties: IConditionalSystemProperties) => boolean) | boolean;
    onTrue?: GameSystem<TContext>;
    onFalse?: GameSystem<TContext>;
}

export class ConditionalSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, IConditionalSystemProperties<TContext>> {
    public override readonly eventName = MetaEventName.Conditional;

    protected declare readonly defaultProperties: IGameSystemInput<IConditionalSystemProperties<TContext>>;

    public constructor(propertiesOrPropertyFactory: IGameSystemInput<IConditionalSystemProperties<TContext>> | ((context?: TContext) => IGameSystemInput<IConditionalSystemProperties<TContext>>)) {
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

    protected override getEffectMessageInternal(context: TContext, properties: IConditionalSystemProperties<TContext>, additionalProperties: Partial<IGameSystemInput<IConditionalSystemProperties<TContext>>> = {}): [string, any[]] {
        return this.getGameAction(context, properties).getEffectMessage(context, additionalProperties);
    }

    protected override canAffectInternal(target: any, context: TContext, properties: IConditionalSystemProperties<TContext>, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IConditionalSystemProperties<TContext>>> = {}): boolean {
        return this.getGameAction(context, properties).canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    protected override hasLegalTargetInternal(context: TContext, properties: IConditionalSystemProperties<TContext>, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IConditionalSystemProperties<TContext>>> = {}): boolean {
        return this.getGameAction(context, properties).hasLegalTarget(context, additionalProperties, mustChangeGameState);
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IConditionalSystemProperties<TContext>, additionalProperties: Partial<IGameSystemInput<IConditionalSystemProperties<TContext>>> = {}): void {
        this.getGameAction(context, properties).queueGenerateEventGameSteps(events, context, additionalProperties);
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IGameSystemInput<IConditionalSystemProperties<TContext>>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.getGameAction(context, properties).hasTargetsChosenByPlayer(
            context,
            player,
            additionalProperties
        );
    }

    private getGameAction(context: TContext, properties: IConditionalSystemProperties<TContext>) {
        let condition = properties.condition;
        if (typeof condition === 'function') {
            condition = condition(context, properties);
        }
        return condition ? properties.onTrue : properties.onFalse;
    }

    protected override prepareProperties(context: TContext, properties: IConditionalSystemProperties<TContext>): void {
        super.prepareProperties(context, properties);

        Contract.assertFalse(properties.onTrue instanceof NoActionSystem && properties.onFalse instanceof NoActionSystem, 'You must provide onTrue or onFalse for ConditionalSystem');
    }
}
