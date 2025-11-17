import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { Aspect } from '../Constants';
import type Game from '../Game';
import * as Contract from '../utils/Contract';
import type { IIgnoreAllAspectsCostAdjusterProperties, IIgnoreSpecificAspectsCostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustmentResolutionProperties, ICostAdjustTriggerResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

export class IgnoreAspectCostAdjuster extends CostAdjuster {
    public readonly ignoredAspect?: Aspect;

    public constructor(
        game: Game,
        source: Card,
        properties: IIgnoreAllAspectsCostAdjusterProperties | IIgnoreSpecificAspectsCostAdjusterProperties
    ) {
        super(game, source, CostAdjustStage.Standard_0, properties);

        if (properties.costAdjustType === CostAdjustType.IgnoreSpecificAspects) {
            if (Array.isArray(properties.ignoredAspect)) {
                Contract.assertTrue(properties.ignoredAspect.length > 0, 'Ignored Aspect array is empty');
            }
            this.ignoredAspect = properties.ignoredAspect;
        }
    }

    protected override canAdjust(card: Card, context: AbilityContext, evaluationResult: ICostAdjustTriggerResult): boolean {
        if (this.ignoredAspect && !evaluationResult.penaltyAspects?.includes(this.ignoredAspect)) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    protected override applyMaxAdjustmentAmount(_card: Card, _context: AbilityContext, result: ICostAdjustmentResolutionProperties) {
        let matchingAspects: Aspect[];

        switch (this.costAdjustType) {
            case CostAdjustType.IgnoreAllAspects:
                matchingAspects = result.penaltyAspects ?? [];
                break;
            case CostAdjustType.IgnoreSpecificAspects:
                matchingAspects = result.penaltyAspects?.filter((aspect) => aspect === this.ignoredAspect) ?? [];
                break;
            default:
                throw new Error(`Unsupported cost adjust type for IgnoreAspectCostAdjuster: ${this.costAdjustType}`);
        }

        result.adjustedCost.applyStaticDecrease(matchingAspects.length * 2);
    }
}
