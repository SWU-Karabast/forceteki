import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import type { ICostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustEvaluationResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

export class ModifyPayStageCostAdjuster extends CostAdjuster {
    public constructor(
        game: Game,
        source: Card,
        properties: Omit<ICostAdjusterProperties, 'costAdjustType'>
    ) {
        const propsWithType: ICostAdjusterProperties = {
            ...properties,
            costAdjustType: CostAdjustType.ModifyPayStage
        };
        super(game, source, propsWithType);
    }

    protected override getCostStage(costAdjustType: CostAdjustType): CostAdjustStage {
        Contract.assertTrue(costAdjustType === CostAdjustType.ModifyPayStage, `ModifyPayStageCostAdjuster must have costAdjustType of '${CostAdjustType.ModifyPayStage}', instead got '${costAdjustType}'`);
        return CostAdjustStage.PayStage_3;
    }

    protected override applyAdjustmentAmount(card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationResult): number {
        const thisAdjustAmount = this.getAmount(card, context.player, context, evaluationResult.remainingCost);
        return evaluationResult.remainingCost + thisAdjustAmount;
    }
}
