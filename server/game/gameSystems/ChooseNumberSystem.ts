import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { NumberTargetResolver } from '../core/ability/abilityTargets/NumberTargetResolver';
import { SelectChoice } from '../core/ability/abilityTargets/SelectChoice';
import { GameStateChangeRequired, MetaEventName, RelativePlayer, TargetMode } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { GameObject } from '../core/GameObject';
import type { Player } from '../core/Player';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import type { INumberTargetResolver } from '../TargetInterfaces';

export type IChooseNumberProperties<TContext extends AbilityContext = AbilityContext> = IGameSystemProperties
  & Omit<INumberTargetResolver<TContext>, 'immediateEffect' | 'mode' | 'condition' | 'dependsOn'>
  & Required<Pick<INumberTargetResolver<TContext>, 'immediateEffect'>>
  & {
      name?: string;
  };

/**
 * A wrapper system for adding a number selection prompt around the execution of the wrapped system.
 * Functions the same as a {@link TargetMode.ChooseNumber} target resolver: the chosen number is written to
 * `context.selects[name]` (and to `context.select` if `name` is `'target'`, the default) for the wrapped system to read.
 *
 * The wrapped system is considered to have a legal target if it does for any number in the `[min, max]` range.
 */
export class ChooseNumberSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, IChooseNumberProperties<TContext>> {
    public override readonly name: string = 'chooseNumber';
    public override readonly effectDescription: string = 'choose a number';
    public override readonly eventName = MetaEventName.ChooseNumber;
    protected override readonly defaultProperties: IGameSystemInput<Partial<IChooseNumberProperties<TContext>>> = {
        name: 'target',
    };

    public override getInnerSystems(properties: IChooseNumberProperties<TContext>): GameSystem<TContext>[] {
        return [properties.immediateEffect];
    }

    protected override canAffectInternal(target: GameObject | GameObject[], context: TContext, properties: IChooseNumberProperties<TContext>, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IChooseNumberProperties<TContext>>> = {}): boolean {
        return this.getCandidateContexts(context, properties).some((candidateContext) =>
            properties.immediateEffect.canAffect(target, candidateContext, additionalProperties, mustChangeGameState)
        );
    }

    protected override hasLegalTargetInternal(context: TContext, properties: IChooseNumberProperties<TContext>, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IChooseNumberProperties<TContext>>> = {}): boolean {
        return this.getCandidateContexts(context, properties).some((candidateContext) =>
            properties.immediateEffect.hasLegalTarget(candidateContext, additionalProperties, mustChangeGameState)
        );
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IChooseNumberProperties<TContext>, additionalProperties: Partial<IGameSystemInput<IChooseNumberProperties<TContext>>> = {}): void {
        // skip the prompt entirely if no choice of number would change the game state
        if (!this.hasLegalTarget(context, additionalProperties, GameStateChangeRequired.MustFullyOrPartiallyResolve)) {
            return;
        }

        const targetResolver = new NumberTargetResolver(properties.name, { ...properties, mode: TargetMode.ChooseNumber }, context.ability);
        const targetResults = context.ability.getDefaultTargetResults(context, false);
        targetResolver.resolve(context, targetResults);

        context.game.queueSimpleStep(() => {
            if (!targetResults.cancelled) {
                properties.immediateEffect.queueGenerateEventGameSteps(events, context, additionalProperties);
            }
        }, `Execute immediate effect for choose number system "${properties.name}"`);
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IGameSystemInput<IChooseNumberProperties<TContext>>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const choosingPlayer = typeof properties.choosingPlayer === 'function' ? properties.choosingPlayer(context) : properties.choosingPlayer;

        if ((choosingPlayer ?? RelativePlayer.Self) === EnumHelpers.asRelativePlayer(context.player, player)) {
            return true;
        }

        return properties.immediateEffect.hasTargetsChosenByPlayer(context, player, additionalProperties);
    }

    /** One copy of the context per number in the `[min, max]` range, each with that number written in as the choice */
    private getCandidateContexts(context: TContext, properties: IChooseNumberProperties<TContext>): TContext[] {
        const min = typeof properties.min === 'function' ? properties.min(context) : properties.min;
        const max = typeof properties.max === 'function' ? properties.max(context) : properties.max;

        const candidateContexts: TContext[] = [];
        for (let value = min; value <= max; value++) {
            const candidateContext = context.copy() as TContext;
            candidateContext.selects[properties.name] = new SelectChoice(value.toString());
            if (properties.name === 'target') {
                candidateContext.select = value.toString();
            }
            candidateContexts.push(candidateContext);
        }

        return candidateContexts;
    }
}
