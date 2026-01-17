import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Aspect } from '../core/Constants';
import type { PlayType } from '../core/Constants';
import * as Contract from '../core/utils/Contract.js';
import { type CostAdjuster } from '../core/cost/CostAdjuster';
import type { ICardWithCostProperty } from '../core/card/propertyMixins/Cost';
import { ResourceCost } from './ResourceCost';
import { CostAdjustStage } from '../core/cost/CostInterfaces';
import { MergedExploitCostAdjuster } from '../abilities/keyword/exploit/MergedExploitCostAdjuster';
import { AdjustedCostEvaluator } from '../core/cost/evaluation/AdjustedCostEvaluator';

/**
 * Represents the resource cost of playing a card. When calculated / paid, will account for
 * any cost adjusters in play that increase or decrease the play cost for the relevant card.
 */
export class PlayCardResourceCost extends ResourceCost<ICardWithCostProperty> {
    public readonly isPlayCost = true;
    public readonly playType: PlayType;
    public readonly aspects: Aspect[];

    public constructor(playType: PlayType, resources: number = null, aspects: Aspect[] = null) {
        super(resources);

        this.playType = playType;
        this.aspects = aspects;
    }

    public usesExploit(context: AbilityContext<ICardWithCostProperty>): boolean {
        return this.getCostAdjustersByStage(context).get(CostAdjustStage.Exploit_1).length > 0;
    }

    public override canPay(context: AbilityContext<ICardWithCostProperty>): boolean {
        if (!('printedCost' in context.source)) {
            return false;
        }

        return super.canPay(context);
    }

    /** Gets any cost adjusters that are coming from an ability that is playing this card (e.g. Alliance Dispatcher) */
    protected getCostAdjustersFromAbility(context: AbilityContext<ICardWithCostProperty>): CostAdjuster[] {
        Contract.assertTrue(context.ability.isPlayCardAbility());
        return context.ability.costAdjusters;
    }

    protected override getCostAdjustersByStage(context: AbilityContext<ICardWithCostProperty>, additionalCostAdjusters: CostAdjuster[] = null): Map<CostAdjustStage, CostAdjuster[]> {
        const costAdjustersByStage = super.getCostAdjustersByStage(
            context,
            (additionalCostAdjusters ?? []).concat(this.getCostAdjustersFromAbility(context))
        );

        // if there are multiple Exploit adjusters, generate a single merged one to represent the total Exploit value
        const exploitAdjusters = costAdjustersByStage.get(CostAdjustStage.Exploit_1);
        if (exploitAdjusters.length > 1) {
            Contract.assertTrue(exploitAdjusters.every((adjuster) => adjuster.isExploit()));
            Contract.assertTrue(context.source.hasCost());
            const mergedExploitAdjuster = new MergedExploitCostAdjuster(exploitAdjusters, context.source, context).initialize();
            costAdjustersByStage.set(CostAdjustStage.Exploit_1, [mergedExploitAdjuster]);
        }

        return costAdjustersByStage;
    }

    protected override buildEvaluationCostTracker(context: AbilityContext): AdjustedCostEvaluator {
        const penaltyAspects = context.player.getPenaltyAspects(this.aspects);

        return new AdjustedCostEvaluator(this.resourceCostAmount, penaltyAspects);
    }
}
