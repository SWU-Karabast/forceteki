import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, PlayType } from '../core/Constants';
import type { ICost, Result } from '../core/cost/ICost';
import { GameEvent } from '../core/event/GameEvent';
import { CostAdjuster } from '../core/cost/CostAdjuster';
import * as Contract from '../core/utils/Contract.js';
import { ExploitPlayCardResourceCost } from '../abilities/keyword/ExploitPlayCardResourceCost';

/**
 * Represents the resource cost of playing a card. When calculated / paid, will account for
 * any cost adjusters in play that increase or decrease the play cost for the relevant card.
 */
export class PlayCardResourceCost<TContext extends AbilityContext = AbilityContext> implements ICost<TContext> {
    public readonly isPlayCost = true;
    public readonly isPrintedResourceCost = [PlayType.PlayFromHand, PlayType.PlayFromOutOfPlay].includes(this.playType);
    public readonly isSmuggleCost = PlayType.Smuggle === this.playType;

    // used for extending this class if any cards have unique after pay hooks
    protected afterPayHook?: ((event: any) => void) = null;

    public constructor(public playType: PlayType) {}

    public usesExploit(): this is ExploitPlayCardResourceCost {
        return false;
    }

    public canPay(context: TContext): boolean {
        if (!('printedCost' in context.source)) {
            return false;
        }

        // get the minimum cost we could possibly pay for this card to see if we have the resources available
        // (aspect penalty is included in this calculation)
        const minCost = this.getAdjustedCost(context);

        return context.player.readyResourceCount >= minCost;
    }

    private costAdjustersFromAbility(context: TContext) {
        Contract.assertTrue(context.ability.isPlayCardAbility());
        return context.ability.costAdjusters;
    }

    public resolve(context: TContext, result: Result): void {
        const availableResources = context.player.readyResourceCount;
        const adjustedCost = this.getAdjustedCost(context);
        if (adjustedCost > availableResources) {
            result.cancelled = true;
            return;
        }
    }

    protected getAdjustedCost(context: TContext): number {
        return context.player.getAdjustedCost(context.playType, context.source, context.target, this.costAdjustersFromAbility(context));
    }

    public payEvents(context: TContext): GameEvent[] {
        const amount = this.getAdjustedCost(context);
        context.costs.resources = amount;
        return [this.getExhaustResourceEvent(context, amount)];
    }

    protected getExhaustResourceEvent(context: TContext, amount: number): GameEvent {
        return new GameEvent(EventName.onExhaustResources, context, { amount }, (event) => {
            event.context.player.markUsedAdjusters(context.playType, event.context.source);
            if (this.isSmuggleCost) {
                event.context.player.exhaustResources(amount, [event.context.source]);
            } else {
                event.context.player.exhaustResources(amount);
            }

            if (this.afterPayHook) {
                this.afterPayHook(event);
            }
        });
    }
}
