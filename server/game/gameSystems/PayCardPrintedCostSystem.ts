import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { GameStateChangeRequired } from '../core/Constants';
import { MetaEventName } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { Player } from '../core/Player';
import { ExhaustResourcesSystem } from './ExhaustResourcesSystem';
import type { GameEvent } from '../core/event/GameEvent';

export interface IPayCardPrintedCostProperties extends ICardTargetSystemProperties {
    player: Player;
}

export class PayCardPrintedCostSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPayCardPrintedCostProperties> {
    public override readonly name = 'payCardPrintedCost';
    public override readonly eventName = MetaEventName.PayCardPrintedCost;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(): void {}

    public override canAffectInternal(card: Card, context: TContext, additionalProperties?: Partial<IPayCardPrintedCostProperties>, mustChangeGameState?: GameStateChangeRequired): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (!card.hasCost()) {
            return false;
        }

        const canPayCost = card.cost === 0 || new ExhaustResourcesSystem({
            amount: card.cost
        }).canAffect(properties.player, context, {}, mustChangeGameState);

        return canPayCost && super.canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties?: Partial<IPayCardPrintedCostProperties>): void {
        super.queueGenerateEventGameSteps(events, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.target[0].cost > 0) {
            new ExhaustResourcesSystem({
                amount: properties.target[0].cost,
                target: properties.player,
            }).queueGenerateEventGameSteps(events, context);
        }
    }
}