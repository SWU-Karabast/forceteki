import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import type { ICostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustTriggerResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

export class IncreaseCostAdjuster extends CostAdjuster {
    public constructor(
        game: Game,
        source: Card,
        properties: Omit<ICostAdjusterProperties, 'costAdjustType'>
    ) {
        const propsWithType: ICostAdjusterProperties = {
            ...properties,
            costAdjustType: CostAdjustType.Increase
        };
        super(game, source, propsWithType);
    }

    protected override getCostStage(costAdjustType: CostAdjustType): CostAdjustStage {
        Contract.assertTrue(costAdjustType === CostAdjustType.Increase, `IncreaseCostAdjuster must have costAdjustType of '${CostAdjustType.Increase}', instead got '${costAdjustType}'`);
        return CostAdjustStage.Increase_4;
    }

    protected override applyMaxAdjustmentAmount(card: Card, context: AbilityContext, result: ICostAdjustTriggerResult) {
        const thisAdjustAmount = this.getAmount(card, context.player, context, result.remainingCost);
        result.remainingCost += thisAdjustAmount;
        result.totalResourceCost = result.remainingCost;
    }
}
