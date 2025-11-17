import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import type { ICostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustmentResolutionProperties } from './CostInterfaces';
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
        super(game, source, CostAdjustStage.Standard_0, propsWithType);
    }

    protected override applyMaxAdjustmentAmount(card: Card, context: AbilityContext, result: ICostAdjustmentResolutionProperties) {
        const thisAdjustAmount = this.getAmount(card, context.player, context);
        result.adjustedCost.applyStaticDecrease(thisAdjustAmount);
    }
}
