import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { Aspect } from '../core/Constants';
import { ResourceCostType } from '../core/cost/CostInterfaces';
import { AdjustedCostEvaluator } from '../core/cost/evaluation/AdjustedCostEvaluator';
import type { Player } from '../core/Player';
import { ResourceCost } from './ResourceCost';

/**
 * Represents a resource payment required by a card effect (e.g. "you may pay 2 resources. If you do, ...").
 * If the payment has aspect icons, the paying player incurs the standard aspect penalty for each one they lack.
 */
export class CardEffectResourcePayment extends ResourceCost<Card> {
    public readonly aspects: Aspect[];

    public constructor(
        resourceCostAmount: number,
        payingPlayer: (context: AbilityContext) => Player = (context) => context.player,
        aspects: Aspect[] = null
    ) {
        super(resourceCostAmount, payingPlayer);

        this.aspects = aspects;
    }

    public override get resourceCostType(): ResourceCostType {
        return ResourceCostType.CardEffectPayment;
    }

    protected override buildEvaluationCostTracker(context: AbilityContext): AdjustedCostEvaluator {
        const penaltyAspects = this.payingPlayer(context).getPenaltyAspects(this.aspects);

        return new AdjustedCostEvaluator(this.resourceCostAmount, penaltyAspects);
    }
}
