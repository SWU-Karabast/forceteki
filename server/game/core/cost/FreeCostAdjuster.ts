import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import type { ICostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustmentResolutionProperties } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

import { registerState } from '../GameObjectUtils';

@registerState()
export class FreeCostAdjuster extends CostAdjuster {
    public constructor(
        game: Game,
        source: Card,
        properties: Omit<ICostAdjusterProperties, 'costAdjustType'>
    ) {
        const propsWithType: ICostAdjusterProperties = {
            ...properties,
            costAdjustType: CostAdjustType.Free
        };
        super(game, source, CostAdjustStage.Standard_0, propsWithType);
    }

    protected override applyMaxAdjustmentAmount(_card: Card, _context: AbilityContext, result: ICostAdjustmentResolutionProperties) {
        result.adjustedCost.setRemainingToDiscountedValue(0);
        result.adjustedCost.disableAllAspectPenalties();
    }
}
