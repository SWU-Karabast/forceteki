import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { Aspect } from '../Constants';
import type { Game } from '../Game';
import { registerState } from '../GameObjectUtils';
import { Contract } from '../utils/Contract';
import type { IProvideAspectsCostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster } from './CostAdjuster';
import type { ICostAdjustmentResolutionProperties, ICostAdjustTriggerResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';

@registerState()
export class ProvideAspectsCostAdjuster extends CostAdjuster {
    private readonly providedAspectsValue: Aspect[] | ((source: Card) => Aspect[]);

    public constructor(
        game: Game,
        source: Card,
        properties: IProvideAspectsCostAdjusterProperties
    ) {
        super(game, source, CostAdjustStage.Standard_0, properties);
        this.providedAspectsValue = properties.providedAspects;
    }

    protected override canAdjust(card: Card, context: AbilityContext, evaluationResult: ICostAdjustTriggerResult): boolean {
        const providedAspects = this.getProvidedAspects();
        if (providedAspects.length === 0) {
            return false;
        }

        const penaltyAspects = evaluationResult.getPenaltyAspects();
        if (!providedAspects.some((aspect) => penaltyAspects.includes(aspect))) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    protected override applyMaxAdjustmentAmount(
        _card: Card,
        _context: AbilityContext,
        result: ICostAdjustmentResolutionProperties
    ): void {
        for (const aspect of this.getProvidedAspects()) {
            // Cancel one penalty entry per provided icon — matches the one-to-one
            // consumption Player.getPenaltyAspects() performs for leader/base aspects.
            result.adjustedCost.disableAspectPenalty(aspect, false);
        }
    }

    private getProvidedAspects(): Aspect[] {
        if (typeof this.providedAspectsValue === 'function') {
            Contract.assertNotNullLike(this.sourceCard, 'ProvideAspectsCostAdjuster requires a source card when providedAspects is a function');
            return this.providedAspectsValue(this.sourceCard);
        }
        return this.providedAspectsValue;
    }
}
