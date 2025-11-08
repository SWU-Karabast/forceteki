import type { Card } from '../card/Card';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import type { ICostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster } from './CostAdjuster';
import { CostAdjustType } from './CostAdjuster';
import { IncreaseCostAdjuster } from './IncreaseCostAdjuster';
import { ModifyPayStageCostAdjuster } from './ModifyPayStageCostAdjuster';

export function create(game: Game, source: Card, properties: ICostAdjusterProperties): CostAdjuster {
    switch (properties.costAdjustType) {
        case CostAdjustType.Increase:
            return new IncreaseCostAdjuster(game, source, properties);
        case CostAdjustType.ModifyPayStage:
            return new ModifyPayStageCostAdjuster(game, source, properties);
        case CostAdjustType.Decrease:
        case CostAdjustType.Free:
        case CostAdjustType.IgnoreAllAspects:
        case CostAdjustType.IgnoreSpecificAspects:
            return new CostAdjuster(game, source, properties);
        default:
            Contract.fail(`Unknown cost adjust type: ${(properties as any).costAdjustType}`);
    }
}
