import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { MsgArg } from '../core/chat/GameChat';
import { getTriggerSourceCardSummary } from '../core/gameSteps/abilityWindow/TriggerWindowBase';

export interface IOptionalSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    title: string;
    innerSystem: GameSystem<TContext>;
}

export class OptionalSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, IOptionalSystemProperties<TContext>> {
    public override readonly eventName = MetaEventName.Optional;

    public override getInnerSystems(properties: IOptionalSystemProperties<TContext>) {
        return [properties.innerSystem];
    }

    protected override getEffectMessageInternal(context: TContext, properties: IOptionalSystemProperties<TContext>): [string, any[]] {
        const [format, args] = properties.innerSystem.getEffectMessage(context);
        return [`choose if they want to ${format}`, args];
    }

    protected override canAffectInternal(target: Player | Card, context: TContext, properties: IOptionalSystemProperties<TContext>, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IOptionalSystemProperties<TContext>>> = {}): boolean {
        return properties.innerSystem.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    protected override hasLegalTargetInternal(context: TContext, properties: IOptionalSystemProperties<TContext>, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<IOptionalSystemProperties<TContext>>> = {}): boolean {
        return properties.innerSystem.hasLegalTarget(context, additionalProperties, mustChangeGameState);
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IOptionalSystemProperties<TContext>, additionalProperties: Partial<IGameSystemInput<IOptionalSystemProperties<TContext>>> = {}): void {
        const sourceCard = getTriggerSourceCardSummary(context.source);

        context.game.promptWithOptionalTrigger(context.player, {
            sourceCard,
            abilityText: properties.title,
            onTrigger: () => {
                context.game.queueSimpleStep(() => {
                    const [effectMessage, effectArgs] = properties.innerSystem.getEffectMessage(context);
                    const messageArgs: MsgArg[] = [context.player, ' uses ', context.source, ' to ', { format: effectMessage, args: effectArgs }];
                    context.game.addMessage(`{${[...Array(messageArgs.length).keys()].join('}{')}}`, ...messageArgs);

                    properties.innerSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
                }, `queue generate event game steps for ${this.name}`);
            },
            onPass: () => undefined,
        });
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IGameSystemInput<IOptionalSystemProperties<TContext>>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return properties.innerSystem.hasTargetsChosenByPlayer(
            context,
            player,
            additionalProperties
        );
    }
}
