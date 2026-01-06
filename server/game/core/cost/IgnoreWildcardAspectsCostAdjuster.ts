import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { Aspect } from '../Constants';
import type Game from '../Game';
import type { IIgnoreWildcardAspectsCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjuster, CostAdjusterRelativePriority } from './CostAdjuster';
import type { ICostAdjustResult, ICostAdjustTriggerResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

export class IgnoreWildcardAspectsCostAdjuster extends CostAdjuster {
    public readonly wildcardAspects: Set<Aspect>;
    public readonly ignoreCount: number;

    public constructor(
        game: Game,
        source: Card,
        properties: IIgnoreWildcardAspectsCostAdjusterProperties
    ) {
        super(game, source, CostAdjustStage.Standard_0, { ...properties, relativePriority: CostAdjusterRelativePriority.Low });

        this.wildcardAspects = properties.wildcardAspects;
        this.ignoreCount = properties.ignoreCount;
    }

    protected override canAdjust(card: Card, context: AbilityContext, evaluationResult: ICostAdjustTriggerResult): boolean {
        if (!evaluationResult.getPenaltyAspects().some((aspect) => this.wildcardAspects.has(aspect))) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    protected override applyMaxAdjustmentAmount(card: Card, context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]): void {
        const penaltyAspects = result.getPenaltyAspects()
            .filter((aspect) => this.wildcardAspects.has(aspect));

        const aspectsIgnored: Aspect[] = [];

        for (const aspect of penaltyAspects) {
            if (aspectsIgnored.length >= this.ignoreCount) {
                break;
            }

            result.adjustedCost.disableAspectPenalty(aspect, false);
            aspectsIgnored.push(aspect);
        }
    }
}