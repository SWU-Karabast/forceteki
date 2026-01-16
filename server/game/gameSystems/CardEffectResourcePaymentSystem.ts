import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameStateChangeRequired } from '../core/Constants';
import { EventName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { CardEffectResourcePayment } from '../costs/CardEffectResourcePayment';
import type { GameEvent } from '../core/event/GameEvent';
import type { ICostResult } from '../core/cost/ICost';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import * as Helpers from '../core/utils/Helpers';

export interface ICardEffectResourcePaymentProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class CardEffectResourcePaymentSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ICardEffectResourcePaymentProperties> {
    public override readonly name = 'cardEffectResourcePayment';
    public override readonly eventName = EventName.OnExhaustResources;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void {}

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (Helpers.asArray(properties.target).length === 1 && Helpers.asArray(properties.target)[0] === context.player) {
            return ['pay {0}', [ChatHelpers.pluralize(properties.amount, '1 resource', 'resources')]];
        }

        return ['make {0} pay {1}', [this.getTargetMessage(properties.target, context), ChatHelpers.pluralize(properties.amount, '1 resource', 'resources')]];
    }

    public override canAffectInternal(
        target: Player | Player[],
        context: TContext,
        additionalProperties?: Partial<ICardEffectResourcePaymentProperties>,
        mustChangeGameState?: GameStateChangeRequired
    ): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (!properties.amount || properties.amount === 0) {
            return false;
        }

        const payment = new CardEffectResourcePayment(
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
        additionalProperties?: Partial<ICardEffectResourcePaymentProperties>
    ): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const targetsArray = Helpers.asArray(properties.target);

        for (const target of targetsArray) {
            const payment = new CardEffectResourcePayment(
                properties.amount,
                (_) => target
            );

            // TODO: In the future we may be able to handle cancellation gracefully
            // For now though, we don't let the player back out at this point
            const costResult: ICostResult = {
                canCancel: false,
                cancelled: false
            };

            payment.resolve(context, costResult);
            payment.queueGameStepsForAdjustmentsAndPayment(events, context, costResult);
        }
    }

    protected override addPropertiesToEvent(
        event: any,
        player: Player,
        context: TContext,
        additionalProperties?: Partial<ICardEffectResourcePaymentProperties>
    ): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = properties.amount;
    }
}