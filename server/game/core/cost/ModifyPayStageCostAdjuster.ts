import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import type { IModifyPayStageCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjustResolutionMode } from './CostAdjuster';
import { CostAdjuster } from './CostAdjuster';
import type { ICostAdjustEvaluationIntermediateResult, ICostAdjustResult, IEvaluationOpportunityCost } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';
import { DynamicOpportunityCost } from './evaluation/DynamicOpportunityCost';

import { registerState } from '../GameObjectUtils';

@registerState()
export class ModifyPayStageCostAdjuster extends CostAdjuster {
    private readonly payStageAmountAfterDiscount: (currentAmount: number) => number;

    public constructor(
        game: Game,
        source: Card,
        properties: IModifyPayStageCostAdjusterProperties
    ) {
        super(game, source, CostAdjustStage.PayStage_3, properties);

        this.payStageAmountAfterDiscount = properties.payStageAmount;
    }

    protected override applyMaxAdjustmentAmount(_card: Card, _context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]) {
        Contract.assertTrue(result.resolutionMode === CostAdjustResolutionMode.Trigger, `Must only be called at Trigger stage, instead got ${result.resolutionMode}`);

        // if the source (Starhawk) was removed via Exploit, no adjustment available
        if (previousTargetSelections?.some((selection) => selection.card === this.sourceCard)) {
            return;
        }

        const amountAfterDiscount = this.payStageAmountAfterDiscount(result.adjustedCost.value);
        result.adjustedCost.setRemainingToDiscountedValue(amountAfterDiscount);
    }

    /**
     * At evaluation time, adds on the "opportunity cost" data for the Exploit step to be able to correctly math out
     * the net cost of removing the unit that is the source of the effect (Starhawk).
     */
    protected override resolveCostAdjustmentInternal(_card: Card, _context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        // generate a "dynamic opportunity cost" so that at the end of the calculation we can determine whether keeping or exploiting yields a better discount
        const dynamicCost = new DynamicOpportunityCost((remainingCost: number) => remainingCost - this.payStageAmountAfterDiscount(remainingCost), evaluationResult);
        evaluationResult.adjustedCost.applyDynamicOffset(dynamicCost);

        const adjustSourceEntry = evaluationResult.costAdjusterTargets.find(
            (t) => t.unit === this.sourceCard
        );

        Contract.assertNotNullLike(adjustSourceEntry, `Source card ${this.sourceCard.internalName} of ModifyPayStageCostAdjuster not found in costAdjusterTargets`);

        const opportunityCost: IEvaluationOpportunityCost = {
            max: this.payStageAmountAfterDiscount(evaluationResult.getTotalResourceCost()),
            dynamic: dynamicCost
        };

        this.setOrAddOpportunityCost(
            adjustSourceEntry,
            opportunityCost,
            CostAdjustStage.Exploit_2,
        );
    }
}
