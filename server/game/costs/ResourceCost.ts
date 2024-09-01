import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, Location, RelativePlayer } from '../core/Constants';
import type { ICost, Result } from '../core/cost/ICost';
import { GameEvent } from '../core/event/GameEvent';

export class ResourceCost implements ICost {
    public isPlayCost = true;
    public isPrintedResourceCost = true;

    // used for extending this class if any cards have unique after pay hooks
    protected afterPayHook?: ((event: any) => void) = null;

    public constructor(public ignoreType: boolean) {}

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

    public payEvent(context: AbilityContext): GameEvent {
        const amount = this.getReducedCost(context);
        context.costs.resources = amount;
        return new GameEvent(EventName.OnSpendResources, { amount, context }, (event) => {
            event.context.player.markUsedAdjusters(context.playType, event.context.source);
            event.context.player.exhaustResources(amount);

            if (this.afterPayHook) {
                this.afterPayHook(event);
            }
        });
    }
}
