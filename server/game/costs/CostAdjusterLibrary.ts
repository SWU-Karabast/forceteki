import { CostAdjuster, CostAdjustType } from '../core/cost/CostAdjuster';
import { Card } from '../core/card/Card';

export function decreaseCost(source: Card, amount: number): CostAdjuster {
    return new CostAdjuster(source.game, source, { costAdjustType: CostAdjustType.Decrease, amount });
}

export function increaseCost(source: Card, amount: number): CostAdjuster {
    return new CostAdjuster(source.game, source, { costAdjustType: CostAdjustType.Increase, amount });
}

export function ignoreCost(source: Card): CostAdjuster {
    return new CostAdjuster(source.game, source, { costAdjustType: CostAdjustType.Free });
}