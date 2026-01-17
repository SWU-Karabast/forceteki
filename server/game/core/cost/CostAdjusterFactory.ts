import type { Card } from '../card/Card';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import type { ICostAdjusterProperties } from './CostAdjuster';
import type { CostAdjuster } from './CostAdjuster';
import { CostAdjustType } from './CostAdjuster';
import { FreeCostAdjuster } from './FreeCostAdjuster';
import { IgnoreAspectCostAdjuster } from './IgnoreAspectCostAdjuster';
import { IncreaseCostAdjuster } from './IncreaseCostAdjuster';
import { ModifyPayStageCostAdjuster } from './ModifyPayStageCostAdjuster';
import { SimpleCostAdjuster } from './SimpleCostAdjuster';

export function create(game: Game, source: Card, properties: ICostAdjusterProperties): CostAdjuster {
    switch (properties.costAdjustType) {
        case CostAdjustType.Increase:
            return new IncreaseCostAdjuster(game, source, properties).initialize();
        case CostAdjustType.ModifyPayStage:
            return new ModifyPayStageCostAdjuster(game, source, properties).initialize();
        case CostAdjustType.IgnoreAllAspects:
        case CostAdjustType.IgnoreSpecificAspects:
            return new IgnoreAspectCostAdjuster(game, source, properties).initialize();
        case CostAdjustType.Free:
            return new FreeCostAdjuster(game, source, properties).initialize();
        case CostAdjustType.Decrease:
            return new SimpleCostAdjuster(game, source, properties).initialize();
        default:
            Contract.fail(`Unknown cost adjust type: ${(properties as any).costAdjustType}`);
    }
}
