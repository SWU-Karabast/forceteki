import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Aspect } from '../core/Constants';
import type { PlayType } from '../core/Constants';
import * as Contract from '../core/utils/Contract.js';
import type { CostAdjuster } from '../core/cost/CostAdjuster';
import type { ICardWithCostProperty } from '../core/card/propertyMixins/Cost';
import { ResourceCost } from './ResourceCost';

/**
 * Represents the resource cost of playing a card. When calculated / paid, will account for
 * any cost adjusters in play that increase or decrease the play cost for the relevant card.
 */
export class PlayCardResourceCost extends ResourceCost<ICardWithCostProperty> {
    public readonly isPlayCost = true;
    public readonly playType: PlayType;
    public readonly aspects: Aspect[];

    public constructor(card: ICardWithCostProperty, playType: PlayType, resources: number = null, aspects: Aspect[] = null) {
        super(resources, card, aspects);

        this.playType = playType;
        this.aspects = aspects;
    }

    public usesExploit(context: AbilityContext<ICardWithCostProperty>): boolean {
        return this.getMatchingCostAdjusters(context).some((adjuster) => adjuster.isExploit());
    }

    protected override getMatchingCostAdjusters(context: AbilityContext<ICardWithCostProperty>, ignoreExploit = false): CostAdjuster[] {
        const matchingCostAdjusterProperties = {
            ignoreExploit,
            additionalCostAdjusters: this.getCostAdjustersFromAbility(context)
        };

        return context.player.getMatchingCostAdjusters(context, matchingCostAdjusterProperties);
    }

    public override getAdjustedCost(context: AbilityContext<ICardWithCostProperty>, ignoreExploit = false): number {
        const runCostAdjustmentProperties = {
            ignoreExploit,
            additionalCostAdjusters: this.getCostAdjustersFromAbility(context)
        };

        return context.player.getAdjustedPlayCardCost(this.resources, this.aspects, context, runCostAdjustmentProperties);
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
}
