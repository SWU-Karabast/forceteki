import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import type { ICostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustTriggerResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

export class SimpleCostAdjuster extends CostAdjuster {
    public constructor(
        game: Game,
        source: Card,
        properties: Omit<ICostAdjusterProperties, 'costAdjustType'>
    ) {
        const propsWithType: ICostAdjusterProperties = {
            ...properties,
            costAdjustType: CostAdjustType.Decrease
        };
        super(game, source, propsWithType);
    }

    protected override getCostStage(costAdjustType: CostAdjustType): CostAdjustStage {
        Contract.assertTrue(costAdjustType === CostAdjustType.Decrease, `SimpleCostAdjuster must have costAdjustType of '${CostAdjustType.Decrease}', instead got '${costAdjustType}'`);
        return CostAdjustStage.Standard_0;
    }

    public override applyMaxAdjustmentAmount(card: Card, context: AbilityContext, result: ICostAdjustTriggerResult) {
        const thisAdjustAmount = this.getAmount(card, context.player, context, result.remainingCost);
        result.remainingCost = this.subtractCostZeroFloor(result.remainingCost, thisAdjustAmount);
    }
}
