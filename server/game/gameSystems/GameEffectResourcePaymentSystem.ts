import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameStateChangeRequired } from '../core/Constants';
import { EventName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { GameEffectResourcePayment } from '../costs/GameEffectResourcePayment';
import type { GameEvent } from '../core/event/GameEvent';
import type { ICostResult } from '../core/cost/ICost';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import * as Helpers from '../core/utils/Helpers';
import type { FormatMessage, MsgArg } from '../core/chat/GameChat';

export interface IGameEffectResourcePaymentProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class GameEffectResourcePaymentSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IGameEffectResourcePaymentProperties> {
    public override readonly name = 'gameEffectResourcePayment';
    public override readonly eventName = EventName.OnExhaustResources;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void {}

    public override canAffectInternal(
        target: Player | Player[],
        context: TContext,
        additionalProperties?: Partial<IGameEffectResourcePaymentProperties>,
        mustChangeGameState?: GameStateChangeRequired
    ): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.amount === 0) {
            return false;
        }

        const payment = new GameEffectResourcePayment(
            properties.amount,
            (_) => target as Player
        );

        if (!payment.canPay(context)) {
            return false;
        }

        return super.canAffectInternal(target, context, additionalProperties, mustChangeGameState);
    }

    public override queueGenerateEventGameSteps(
        events: GameEvent[],
        context: TContext,
        additionalProperties?: Partial<IGameEffectResourcePaymentProperties>
    ): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const targetsArray = Helpers.asArray(properties.target);

        for (const target of targetsArray) {
            const payment = new GameEffectResourcePayment(
                properties.amount,
                (_) => target
            );

            const costResult: ICostResult = {
                canCancel: context.ability?.optional ?? false,
                cancelled: false
            };

            payment.resolve(context, costResult);
            payment.queueGameStepsForAdjustmentsAndPayment(events, context, costResult);
            context.game.queueSimpleStep(() => {
                if (!costResult.cancelled) {
                    this.addMessage(context);
                }
            }, 'log message for resource payment');
        }
    }

    private addMessage(context: TContext) {
        const properties = this.generatePropertiesFromContext(context);
        const creditTokens = context.costs.creditTokens ?? 0;
        const resources = properties.amount - creditTokens;

        const args: MsgArg[] = [];

        if (resources > 0) {
            args.push(ChatHelpers.pluralize(resources, '1 resource', 'resources'));
        }

        if (creditTokens > 0) {
            args.push(ChatHelpers.pluralize(creditTokens, '1 Credit token', 'Credit tokens'));
        }

        const ammountMessage: FormatMessage = {
            format: ChatHelpers.formatWithLength(args.length),
            args: args
        };

        context.game.addMessage('{0} pays {1}', context.player, ammountMessage);
    }

    // protected override addPropertiesToEvent(
    //     event: any,
    //     player: Player,
    //     context: TContext,
    //     additionalProperties?: Partial<IGameEffectResourcePaymentProperties>
    // ): void {
    //     const properties = this.generatePropertiesFromContext(context, additionalProperties);
    //     super.addPropertiesToEvent(event, player, context, additionalProperties);
    //     event.amount = properties.amount;
    //     event.payment = new GameEffectResourcePayment(properties.amount);
    // }
}