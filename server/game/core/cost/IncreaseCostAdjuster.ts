import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import type { ICostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustmentResolutionProperties } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

import { registerState } from '../GameObjectUtils';

@registerState()
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
        super(game, source, CostAdjustStage.Increase_6, propsWithType);
    }

    protected override applyMaxAdjustmentAmount(card: Card, context: AbilityContext, result: ICostAdjustmentResolutionProperties) {
        const thisAdjustAmount = this.getAmount(card, this.sourcePlayer, context);
        result.adjustedCost.applyStaticIncrease(thisAdjustAmount);
    }
}
