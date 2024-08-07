import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, Location, RelativePlayer } from '../core/Constants';
import type { ICost, Result } from '../core/cost/ICost';
import { Event } from '../core/event/Event';
import Card from '../core/card/Card';

const CANCELLED = 'CANCELLED';
const STOP = 'STOP';

type PoolOption = Card | typeof CANCELLED | typeof STOP;
interface Props {
    reducedCost: number;
    minFate?: number;
    maxFate?: number;
    pool?: PoolOption;
    numberOfChoices?: number;
}

export class AdjustableResourceCost implements ICost {
    public isPlayCost = true;
    public isPrintedResourceCost = true;
    constructor(public ignoreType: boolean) {}

    public canPay(context: AbilityContext): boolean {
        if (context.source.printedCost === null) {
            return false;
        }

        // get the minimum cost we could possibly pay for this card to see if we have the resources available
        // (aspect penalty is included in this calculation)
        const minCost = context.player.getMinimumPossibleCost(context.playType, context, null, this.ignoreType);
        if (minCost === 0) {
            return true;
        }

        return context.player.countSpendableResources() >= minCost;
    }

    public resolve(context: AbilityContext, result: Result): void {
        const availableResources = context.player.countSpendableResources();
        const reducedCost = this.getReducedCost(context);
        if (reducedCost > availableResources) {
            result.cancelled = true;
            return;
        }
    }

    protected getReducedCost(context: AbilityContext): number {
        return context.player.getAdjustedCost(context.playType, context.source, null, this.ignoreType, context.costAspects);
    }

    /**
     * USED FOR EXTENDING THIS CLASS
     */
    protected afterPayHook(event: any): void {}

    public payEvent(context: AbilityContext): Event {
        const amount = this.getReducedCost(context);
        context.costs.resources = amount;
        return new Event(EventName.OnSpendResources, { amount, context }, (event) => {
            event.context.player.markUsedAdjusters(context.playType, event.context.source);
            event.context.player.exhaustResources(amount);
            this.afterPayHook(event);
        });
    }
}