import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { MetaEventName, RelativePlayer } from '../core/Constants';
import { GameStateChangeRequired } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import { CardTargetResolver } from '../core/ability/abilityTargets/CardTargetResolver';
import * as Helpers from '../core/utils/Helpers';
import type { Player } from '../core/Player';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import type { ICardTargetResolver } from '../TargetInterfaces';
import type { MsgArg } from '../core/chat/GameChat';

export type ISelectCardProperties<TContext extends AbilityContext = AbilityContext> = ICardTargetSystemProperties
  & Helpers.DistributiveOmit<ICardTargetResolver<TContext>, 'immediateEffect'>
  & Required<Pick<ICardTargetResolver<TContext>, 'immediateEffect'>>
  & {
      player?: RelativePlayer;
      cancelHandler?: () => void;
      optional?: boolean;
      name?: string;
      effect?: string;
      effectArgs?: (context) => string[];
      cancelIfNoTargets?: boolean;
  };

/**
 * A wrapper system for adding a target selection prompt around the execution the wrapped system.
 * Functions the same as a targetResolver and used in situations where one can't be created (e.g., costs).
 */
export class SelectCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ISelectCardProperties<TContext>> {
    public override readonly name: string = 'selectCard';
    public override readonly eventName: MetaEventName.SelectCard;
    protected override readonly defaultProperties: Partial<ISelectCardProperties<TContext>> = {
        cardCondition: () => true,
        optional: false,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { target, effect, effectArgs } = this.generatePropertiesFromContext(context);
        if (effect) {
            return [effect, effectArgs ? effectArgs(context) : []];
        }
        return ['choose a target for {0}', [this.getTargetMessage(target, context)]];
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        if (!properties.name) {
            properties.name = properties.isCost ? 'cost' : 'target';
        }

        return properties;
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const targetResolver = this.generateTargetResolver(context, additionalProperties, mustChangeGameState);
        return targetResolver.canTarget(card, context);
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const targetResolver = this.generateTargetResolver(context, additionalProperties, mustChangeGameState);
        return targetResolver.hasLegalTarget(context);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}): void {
        if (!this.hasLegalTarget(context, additionalProperties)) {
            return;
        }

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const canCancel = properties.cancelHandler != null;

        const targetResolver = this.generateTargetResolver(context, additionalProperties);
        const targetResults = context.ability?.getDefaultTargetResults(context, canCancel) ?? {
            canIgnoreAllCosts: false,
            cancelled: false,
            payCostsFirst: false,
            delayTargeting: null,
            canCancel,
        };
        targetResolver.resolve(context, targetResults);

        context.game.queueSimpleStep(() => {
            if (targetResults.cancelled || (properties.cancelIfNoTargets && Helpers.asArray(context.target).length === 0)) {
                properties.cancelHandler?.();
            } else {
                if (!properties.isCost && Helpers.asArray(context.target).length > 0) {
                    this.addOnSelectEffectMessage(context, properties);
                }

                properties.immediateEffect.queueGenerateEventGameSteps(events, context, additionalProperties);
            }
        }, `Execute immediate effect for select card system "${properties.name}"`);
    }

    private addOnSelectEffectMessage(
        context: TContext,
        properties: ISelectCardProperties<TContext>
    ) {
        const [effectMessage, effectArgs] = properties.immediateEffect.getEffectMessage(context);
        const messageArgs: MsgArg[] = [context.player, ' uses ', context.source, ' to ', { format: effectMessage, args: effectArgs }];

        context.game.addMessage(`{${[...Array(messageArgs.length).keys()].join('}{')}}`, ...messageArgs);
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.player === EnumHelpers.asRelativePlayer(context.player, player)) {
            return true;
        }

        return properties.immediateEffect.hasTargetsChosenByPlayer(context, player, additionalProperties);
    }

    private generateTargetResolver(context: TContext, additionalProperties: Partial<ISelectCardProperties<TContext>> = {}, mustChangeGameState?: GameStateChangeRequired): CardTargetResolver {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const targetResolverProperties = { choosingPlayer: properties.player, mustChangeGameState, ...properties };
        if (properties.isCost) {
            targetResolverProperties.optional = false;
            targetResolverProperties.mustChangeGameState = GameStateChangeRequired.MustFullyResolve;
        } else if (properties.immediateEffect.isOptional(context)) {
            targetResolverProperties.optional = true;
        }

        if (targetResolverProperties.waitingPromptTitle == null && context.source.isCard()) {
            targetResolverProperties.waitingPromptTitle = `Waiting for opponent to use ${context.source.title}`;
        }

        return new CardTargetResolver(properties.name, targetResolverProperties, context.ability);
    }
}
