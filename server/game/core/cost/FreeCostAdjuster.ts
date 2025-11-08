import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import type { ICostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustEvaluationResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

export class IncreaseCostAdjuster extends CostAdjuster {
    public constructor(
        game: Game,
        source: Card,
        properties: Omit<ICostAdjusterProperties, 'costAdjustType'>
    ) {
        const propsWithType: ICostAdjusterProperties = {
            ...properties,
            costAdjustType: CostAdjustType.Free
        };
        super(game, source, propsWithType);
    }

    protected override getCostStage(costAdjustType: CostAdjustType): CostAdjustStage {
        Contract.assertTrue(costAdjustType === CostAdjustType.Free, `FreeCostAdjuster must have costAdjustType of '${CostAdjustType.Free}', instead got '${costAdjustType}'`);
        return CostAdjustStage.Standard_0;
    }

    protected override applyAdjustmentAmount(card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationResult): number {
        return 0;
    }
}
