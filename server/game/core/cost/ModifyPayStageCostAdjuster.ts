import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import { DynamicOpportunityCost } from './AdjustedCostEvaluator';
import type { IModifyPayStageCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjustResolutionMode } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustEvaluationResult, ICostAdjustResult, IEvaluationOpportunityCost } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

export class ModifyPayStageCostAdjuster extends CostAdjuster {
    private readonly payStageAmountAfterDiscount: (currentAmount: number) => number;

    public constructor(
        game: Game,
        source: Card,
        properties: IModifyPayStageCostAdjusterProperties
    ) {
        super(game, source, properties);

        this.payStageAmountAfterDiscount = properties.payStageAmount;
    }

    protected override getCostStage(costAdjustType: CostAdjustType): CostAdjustStage {
        Contract.assertTrue(costAdjustType === CostAdjustType.ModifyPayStage, `ModifyPayStageCostAdjuster must have costAdjustType of '${CostAdjustType.ModifyPayStage}', instead got '${costAdjustType}'`);
        return CostAdjustStage.PayStage_3;
    }

    protected override applyMaxAdjustmentAmount(_card: Card, _context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]) {
        Contract.assertTrue(result.resolutionMode === CostAdjustResolutionMode.Trigger, `Must only be called at Trigger stage, instead got ${result.resolutionMode}`);

        if (previousTargetSelections?.some((selection) => selection.card === this.source)) {
            return;
        }

        const amountAfterDiscount = this.payStageAmountAfterDiscount(result.adjustedCost.value);
        result.adjustedCost.setRemainingToDiscountedValue(amountAfterDiscount);
    }


    public override resolveCostAdjustmentInternal(_card: Card, _context: AbilityContext, evaluationResult: ICostAdjustEvaluationResult) {
        const dynamicCost = new DynamicOpportunityCost((remainingCost: number) => this.payStageAmountAfterDiscount(remainingCost));
        evaluationResult.adjustedCost.applyDynamicOffset(dynamicCost);

        const adjustSourceEntry = evaluationResult.costAdjusterTargets.targets.find(
            (t) => t.unit === this.source
        );

        Contract.assertNotNullLike(adjustSourceEntry, `Source card ${this.source.internalName} of ModifyPayStageCostAdjuster not found in costAdjusterTargets`);

        const opportunityCost: IEvaluationOpportunityCost = {
            max: this.payStageAmountAfterDiscount(evaluationResult.totalResourceCost),
            dynamic: dynamicCost
        };

        this.setOrAddOpportunityCost(
            adjustSourceEntry,
            opportunityCost,
            CostAdjustStage.Exploit_1,
        );
    }
}
