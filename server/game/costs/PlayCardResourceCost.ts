import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Aspect } from '../core/Constants';
import { PlayType } from '../core/Constants';
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
export class PlayCardResourceCost<TContext extends AbilityContext = AbilityContext> implements ICost<TContext> {
    public readonly aspects: Aspect[];
    public readonly card: ICardWithCostProperty;
    public readonly isPlayCost = true;
    public readonly playType: PlayType;
    public readonly resources: number;

    // used for extending this class if any cards have unique after pay hooks
    protected afterPayHook?: ((event: any) => void) = null;

    public constructor(card: ICardWithCostProperty, playType: PlayType, resources: number = null, aspects: Aspect[] = null) {
        this.card = card;
        this.playType = playType;

        this.resources = resources ?? card.cost;
        this.aspects = aspects ?? card.aspects;
    }

    public usesExploit(context: TContext): boolean {
        return this.getMatchingCostAdjusters(context).some((adjuster) => adjuster.isExploit());
    }

    public canPay(context: TContext): boolean {
        if (!('printedCost' in context.source)) {
            return false;
        }

        // if this play card action has an exploit adjuster that can't activate, the action won't fire
        // (we will have also generated a non-exploit version of the same play card action that still can)
        const exploitAdjuster = this.getMatchingCostAdjusters(context).find((adjuster) => adjuster.isExploit());
        if (exploitAdjuster && !exploitAdjuster.canAdjust(this.playType, context.source, context)) {
            return false;
        }

        // get the minimum cost we could possibly pay for this card to see if we have the resources available
        // (aspect penalty is included in this calculation)
        const minCost = this.getAdjustedCost(context);

        return context.player.readyResourceCount >= minCost;
    }

    private getMatchingCostAdjusters(context: TContext, ignoreExploit = false): CostAdjuster[] {
        return context.player.getMatchingCostAdjusters(context, null, this.costAdjustersFromAbility(context), ignoreExploit);
    }

    private costAdjustersFromAbility(context: TContext): CostAdjuster[] {
        Contract.assertTrue(context.ability.isPlayCardAbility());
        return context.ability.costAdjusters;
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
        return context.player.getAdjustedCost(this.resources, this.aspects, context, this.costAdjustersFromAbility(context), ignoreExploit);
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
            if (this.playType === PlayType.Smuggle) {
                Contract.assertTrue(event.context.source.canBeExhausted());
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
