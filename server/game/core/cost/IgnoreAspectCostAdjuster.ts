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
    public readonly matchMultiple?: boolean;

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
            this.matchMultiple = properties.matchMultiple ?? false;
        }
    }

    protected override canAdjust(card: Card, context: AbilityContext, evaluationResult: ICostAdjustTriggerResult): boolean {
        if (this.ignoredAspect && !evaluationResult.getPenaltyAspects()?.includes(this.ignoredAspect)) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    protected override applyMaxAdjustmentAmount(_card: Card, _context: AbilityContext, result: ICostAdjustmentResolutionProperties) {
        switch (this.costAdjustType) {
            case CostAdjustType.IgnoreAllAspects:
                result.adjustedCost.disableAllAspectPenalties();
                break;
            case CostAdjustType.IgnoreSpecificAspects:
                Contract.assertNotNullLike(this.ignoredAspect, 'Ignored Aspect must be defined for IgnoreSpecificAspects cost adjuster');
                Contract.assertNotNullLike(this.matchMultiple, 'matchMultiple flag must be defined for IgnoreSpecificAspects cost adjuster');
                result.adjustedCost.disableAspectPenalty(this.ignoredAspect, this.matchMultiple);
                break;
            default:
                throw new Error(`Unsupported cost adjust type for IgnoreAspectCostAdjuster: ${this.costAdjustType}`);
        }
    }
}
