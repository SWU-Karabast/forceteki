import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Aspect } from '../core/Constants';
import type { PlayType } from '../core/Constants';
import type { ICost } from '../core/cost/ICost';
import * as Contract from '../core/utils/Contract.js';
import type { CostAdjuster } from '../core/cost/CostAdjuster';
import type { ICardWithCostProperty } from '../core/card/propertyMixins/Cost';
import { ResourceCost } from './ResourceCost';

/**
 * Represents the resource cost of playing a card. When calculated / paid, will account for
 * any cost adjusters in play that increase or decrease the play cost for the relevant card.
 */
export class PlayCardResourceCost<TContext extends AbilityContext = AbilityContext> extends ResourceCost implements ICost<TContext> {
    public readonly isPlayCost = true;
    public readonly playType: PlayType;

    public constructor(card: ICardWithCostProperty, playType: PlayType, resources: number = null, aspects: Aspect[] = null) {
        super(resources, card, aspects);

        this.playType = playType;
    }

    public usesExploit(context: TContext): boolean {
        return this.getMatchingCostAdjusters(context).some((adjuster) => adjuster.isExploit());
    }

    public override canPay(context: TContext): boolean {
        if (!('printedCost' in context.source)) {
            return false;
        }

        // if this play card action has an exploit adjuster that can't activate, the action won't fire
        // (we will have also generated a non-exploit version of the same play card action that still can)

        // TODO THIS PR: do we still need this check?

        const exploitAdjuster = this.getMatchingCostAdjusters(context).find((adjuster) => adjuster.isExploit());
        if (exploitAdjuster && !exploitAdjuster.canAdjust(this.playType, context.source, context)) {
            return false;
        }

        return super.canPay(context);
    }

    /** Gets any cost adjusters that are coming from an ability that is playing this card (e.g. Alliance Dispatcher) */
    protected override getAdditionalCostAdjusters(context: TContext): CostAdjuster[] {
        Contract.assertTrue(context.ability.isPlayCardAbility());
        return context.ability.costAdjusters;
    }
}
