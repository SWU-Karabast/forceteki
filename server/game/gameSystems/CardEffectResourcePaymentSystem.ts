import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameStateChangeRequired } from '../core/Constants';
import { EventName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { CardEffectResourcePayment } from '../costs/CardEffectResourcePayment';
import type { GameEvent } from '../core/event/GameEvent';
import type { ICostResult } from '../core/cost/ICost';
import { Helpers } from '../core/utils/Helpers';
import { TextHelper } from '../core/utils/TextHelper';

export interface ICardEffectResourcePaymentProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class CardEffectResourcePaymentSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ICardEffectResourcePaymentProperties> {
    public override readonly name = 'cardEffectResourcePayment';
    public override readonly eventName = EventName.OnExhaustResources;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override eventHandlerInternal(): void {}

    protected override getEffectMessageInternal(context: TContext, properties: ICardEffectResourcePaymentProperties): [string, any[]] {
        if (Helpers.asArray(properties.target).length === 1 && Helpers.asArray(properties.target)[0] === context.player) {
            return ['pay {0}', [TextHelper.resource(properties.amount)]];
        }

        return ['make {0} pay {1}', [this.getTargetMessage(properties.target, context), TextHelper.resource(properties.amount)]];
    }

    protected override canAffectInternal(target: Player | Player[], context: TContext, properties: ICardEffectResourcePaymentProperties, mustChangeGameState: GameStateChangeRequired): boolean {
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

        return super.canAffectInternal(target, context, properties, mustChangeGameState);
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: ICardEffectResourcePaymentProperties): void {
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

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, properties: ICardEffectResourcePaymentProperties): void {
        super.addPropertiesToEvent(event, player, context, properties);
        event.amount = properties.amount;
    }
}