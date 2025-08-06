import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { GameSystem, IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { MsgArg } from '../core/chat/GameChat';

export interface IOptionalSystemProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties {
    title: string;
    innerSystem: GameSystem<TContext>;
}

export class OptionalSystem<TContext extends AbilityContext = AbilityContext> extends AggregateSystem<TContext, IOptionalSystemProperties<TContext>> {
    public override readonly eventName = MetaEventName.Optional;

    public override getInnerSystems(properties: IOptionalSystemProperties<TContext>) {
        return [properties.innerSystem];
    }

    public override getEffectMessage(context: TContext, additionalProperties: Partial<IOptionalSystemProperties<TContext>> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const [format, args] = properties.innerSystem.getEffectMessage(context);
        return [`choose if they want to ${format}`, args];
    }

    public override canAffectInternal(target: Player | Card, context: TContext, additionalProperties: Partial<IOptionalSystemProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return properties.innerSystem.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IOptionalSystemProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return properties.innerSystem.hasLegalTarget(context, additionalProperties, mustChangeGameState);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IOptionalSystemProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        context.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: `Trigger the ability '${properties.title}' or pass`,
            choices: ['Trigger', 'Pass'],
            handlers: [
                () => {
                    context.game.queueSimpleStep(() => {
                        const [effectMessage, effectArgs] = properties.innerSystem.getEffectMessage(context);
                        const messageArgs: MsgArg[] = [context.player, ' uses ', context.source, ' to ', { format: effectMessage, args: effectArgs }];
                        context.game.addMessage(`{${[...Array(messageArgs.length).keys()].join('}{')}}`, ...messageArgs);

                        properties.innerSystem.queueGenerateEventGameSteps(events, context, additionalProperties);
                    }, `queue generate event game steps for ${this.name}`);
                },
                () => undefined,
            ],
        });
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IOptionalSystemProperties<TContext>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return properties.innerSystem.hasTargetsChosenByPlayer(
            context,
            player,
            additionalProperties
        );
    }
}
