import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { GameStateChangeRequired } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { Player } from '../core/Player';
import type { GameEvent } from '../core/event/GameEvent';
import { CardEffectResourcePaymentSystem } from './CardEffectResourcePaymentSystem';

export interface IPayCardPrintedCostProperties extends ICardTargetSystemProperties {
    player: Player;
}

export class PayCardPrintedCostSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPayCardPrintedCostProperties> {
    public override readonly name = 'payCardPrintedCost';
    public override readonly eventName = MetaEventName.PayCardPrintedCost;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override eventHandlerInternal(): void {}

    protected override canAffectInternal(card: Card, context: TContext, properties: IPayCardPrintedCostProperties, mustChangeGameState: GameStateChangeRequired): boolean {
        if (!card.hasCost()) {
            return false;
        }

        const canPayCost = card.cost === 0 || new CardEffectResourcePaymentSystem({
            amount: card.cost
        }).canAffect(properties.player, context, {}, mustChangeGameState);

        return canPayCost && super.canAffectInternal(card, context, properties, mustChangeGameState);
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IPayCardPrintedCostProperties, additionalProperties: Partial<IGameSystemInput<IPayCardPrintedCostProperties>> = {}): void {
        super.queueGenerateEventGameStepsInternal(events, context, properties, additionalProperties);

        const target = properties.target[0];
        if (target.hasCost() && target.cost > 0) {
            new CardEffectResourcePaymentSystem({
                amount: target.cost,
                target: properties.player,
            }).queueGenerateEventGameSteps(events, context);
        }
    }
}