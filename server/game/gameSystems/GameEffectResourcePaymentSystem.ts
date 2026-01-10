import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameStateChangeRequired } from '../core/Constants';
import { EventName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import * as Helpers from '../core/utils/Helpers';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { Player } from '../core/Player';
import { GameEffectResourcePayment } from '../costs/GameEffectResourcePayment';
import type { GameEvent } from '../core/event/GameEvent';
import type { ICostResult } from '../core/cost/ICost';

export interface IGameEffectResourcePaymentProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class GameEffectResourcePaymentSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IGameEffectResourcePaymentProperties> {
    public override readonly name = 'gameEffectResourcePayment';
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
        additionalProperties?: Partial<IGameEffectResourcePaymentProperties>,
        mustChangeGameState?: GameStateChangeRequired
    ): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.amount === 0) {
            return false;
        }

        const payment = new GameEffectResourcePayment(properties.amount);

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
        const payment = new GameEffectResourcePayment(properties.amount);
        const costResult: ICostResult = {
            canCancel: true,
            cancelled: false
        };

        payment.resolve(context, costResult);
        payment.queueGameStepsForAdjustmentsAndPayment(events, context, costResult);
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