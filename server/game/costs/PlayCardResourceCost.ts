import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Aspect } from '../core/Constants';
import type { PlayType } from '../core/Constants';
import * as Contract from '../core/utils/Contract.js';
import { CostAdjustType, type CostAdjuster } from '../core/cost/CostAdjuster';
import type { ICardWithCostProperty } from '../core/card/propertyMixins/Cost';
import { ResourceCost } from './ResourceCost';
import type { IGetMatchingCostAdjusterProperties, IRunCostAdjustmentProperties } from '../core/cost/CostInterfaces';
import { MergedExploitCostAdjuster } from '../abilities/keyword/exploit/MergedExploitCostAdjuster';
import * as Helpers from '../core/utils/Helpers';

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
        return this.getMatchingCostAdjusters(context).some((adjuster) => adjuster.isExploit());
    }

    private buildCostAdjustmentProperties(context: AbilityContext<ICardWithCostProperty>, ignoreExploit = false): IRunCostAdjustmentProperties {
        return {
            ignoreExploit,
            additionalCostAdjusters: this.getCostAdjustersFromAbility(context)
        };
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

    public override getAdjustedCost(context: AbilityContext<ICardWithCostProperty>, ignoreExploit = false) {
        const costAdjustmentProperties = this.buildCostAdjustmentProperties(context, ignoreExploit);

        // if any aspect penalties, check modifiers for them separately
        let aspectPenaltiesTotal = 0;

        const penaltyAspects = context.player.getPenaltyAspects(this.aspects);
        for (const penaltyAspect of penaltyAspects) {
            const penaltyAspectParams = { ...costAdjustmentProperties, penaltyAspect };
            aspectPenaltiesTotal += this.runAdjustersForAspectPenalties(2, context, penaltyAspectParams);
        }

        const penalizedCost = this.resources + aspectPenaltiesTotal;
        return this.runAdjustersForCost(penalizedCost, context.source, context, costAdjustmentProperties);
    }

    /**
     * Runs the Adjusters for a specific cost type - either base cost or an aspect penalty - and returns the modified result
     * @param baseCost
     * @param properties Additional parameters for determining cost adjustment
     */
    private runAdjustersForAspectPenalties(baseCost: number, context: AbilityContext<ICardWithCostProperty>, properties: IRunCostAdjustmentProperties) {
        const matchingAdjusters = this.getMatchingCostAdjusters(context, properties);

        const ignoreAllAspectPenalties = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.IgnoreAllAspects).length > 0;

        const ignoreSpecificAspectPenalty = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.IgnoreSpecificAspects).length > 0;

        let cost = baseCost;
        if (ignoreAllAspectPenalties || ignoreSpecificAspectPenalty) {
            cost -= 2;
        }

        return Math.max(cost, 0);
    }

    protected override getMatchingCostAdjusters(context: AbilityContext<ICardWithCostProperty>, properties: IGetMatchingCostAdjusterProperties = null): CostAdjuster[] {
        const adjustPropsWithAbilityAdjusters: IGetMatchingCostAdjusterProperties = { ...properties };
        if (!adjustPropsWithAbilityAdjusters?.additionalCostAdjusters) {
            adjustPropsWithAbilityAdjusters.additionalCostAdjusters = this.getCostAdjustersFromAbility(context);
        }

        const allMatchingAdjusters = super.getMatchingCostAdjusters(context, adjustPropsWithAbilityAdjusters);

        if (properties?.ignoreExploit) {
            return allMatchingAdjusters.filter((adjuster) => !adjuster.isExploit());
        }

        const { trueAra: exploitAdjusters, falseAra: nonExploitAdjusters } =
                    Helpers.splitArray(allMatchingAdjusters, (adjuster) => adjuster.isExploit());

        // if there are multiple Exploit adjusters, generate a single merged one to represent the total Exploit value
        const matchingAdjusters = nonExploitAdjusters;
        if (exploitAdjusters.length > 1) {
            Contract.assertTrue(exploitAdjusters.every((adjuster) => adjuster.isExploit()));
            Contract.assertTrue(context.source.hasCost());
            matchingAdjusters.unshift(new MergedExploitCostAdjuster(exploitAdjusters, context.source, context));
        } else {
            matchingAdjusters.unshift(...exploitAdjusters);
        }

        return matchingAdjusters;
    }
}
