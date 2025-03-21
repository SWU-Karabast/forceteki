import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Aspect } from '../core/Constants';
import { EventName } from '../core/Constants';
import type { ICost, ICostResult } from '../core/cost/ICost';
import { GameEvent } from '../core/event/GameEvent';
import * as Contract from '../core/utils/Contract.js';
import type { CostAdjuster } from '../core/cost/CostAdjuster';
import type { ICardWithCostProperty } from '../core/card/propertyMixins/Cost';

/**
 * Represents the resource cost of playing a card. When calculated / paid, will account for
 * any cost adjusters in play that increase or decrease the play cost for the relevant card.
 */
export abstract class ResourceCost<TContext extends AbilityContext = AbilityContext> implements ICost<TContext> {
    public readonly card: ICardWithCostProperty;
    public readonly aspects: Aspect[];
    public readonly resources: number;

    public abstract readonly isPlayCost;

    // used for extending this class if any cards have unique after pay hooks
    protected afterPayHook?: ((event: any) => void) = null;

    public constructor(resources: number, card: ICardWithCostProperty, aspects: Aspect[] = []) {
        this.aspects = aspects;
        this.card = card;
        this.resources = resources;
    }

    public canPay(context: TContext): boolean {
        // get the minimum cost we could possibly pay for this card to see if we have the resources available
        // (aspect penalty is included in this calculation, if relevant)
        const minCost = this.getAdjustedCost(context);

        return context.player.readyResourceCount >= minCost;
    }

    protected getMatchingCostAdjusters(context: TContext, ignoreExploit = false): CostAdjuster[] {
        return context.player.getMatchingCostAdjusters(context, null, this.getAdditionalCostAdjusters(context), ignoreExploit);
    }

    public resolve(context: TContext, result: ICostResult): void {
        const availableResources = context.player.readyResourceCount;
        const adjustedCost = this.getAdjustedCost(context);
        if (adjustedCost > availableResources) {
            result.cancelled = true;
            return;
        }
    }

    public getAdjustedCost(context: TContext, ignoreExploit = false): number {
        return context.player.getAdjustedCost(this.resources, this.aspects, context, this.getAdditionalCostAdjusters(context), ignoreExploit);
    }

    public queueGenerateEventGameSteps(events: GameEvent[], context: TContext, result: ICostResult) {
        Contract.assertNotNullLike(result);


        for (const costAdjuster of this.getMatchingCostAdjusters(context)) {
            costAdjuster.queueGenerateEventGameSteps(events, context, this, result);
        }

        context.game.queueSimpleStep(() => {
            if (!result.cancelled) {
                events.push(this.getExhaustResourceEvent(context));
            }
        }, `generate exhaust resources event for ${context.source.internalName}`);
    }

    protected getExhaustResourceEvent(context: TContext): GameEvent {
        return new GameEvent(EventName.onExhaustResources, context, { amount: this.getAdjustedCost(context) }, (event) => {
            const amount = this.getAdjustedCost(context);
            context.costs.resources = amount;

            event.context.player.markUsedAdjusters(context.playType, event.context.source, context, event.context.target);
            event.context.player.exhaustResources(amount);

            if (this.afterPayHook) {
                this.afterPayHook(event);
            }
        });
    }

    // exists to be overriden by subclasses
    protected getAdditionalCostAdjusters(context: TContext): CostAdjuster[] {
        return [];
    }
}
