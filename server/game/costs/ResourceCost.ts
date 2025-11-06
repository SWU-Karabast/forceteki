import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, PlayType, Stage } from '../core/Constants';
import type { ICost, ICostResult } from '../core/cost/ICost';
import { GameEvent } from '../core/event/GameEvent';
import * as Contract from '../core/utils/Contract.js';
import { CostAdjustType, type CostAdjuster, type ICanAdjustProperties } from '../core/cost/CostAdjuster';
import type { Card } from '../core/card/Card';
import type { IGetMatchingCostAdjusterProperties, IRunCostAdjustmentProperties } from '../core/cost/CostInterfaces';
import type { IUpgradeCard } from '../core/card/CardInterfaces';

/**
 * Represents the resource cost of playing a card. When calculated / paid, will account for
 * any cost adjusters in play that increase or decrease the play cost for the relevant card.
 */
export abstract class ResourceCost<TCard extends Card = Card> implements ICost<AbilityContext<TCard>> {
    public readonly resources: number;

    public abstract readonly isPlayCost;

    // used for extending this class if any cards have unique after pay hooks
    protected afterPayHook?: ((event: any) => void) = null;

    public constructor(resources: number) {
        this.resources = resources;
    }

    public isResourceCost(): this is ResourceCost {
        return true;
    }

    public canPay(context: AbilityContext<TCard>): boolean {
        // get the minimum cost we could possibly pay for this card to see if we have the resources available
        // (aspect penalty is included in this calculation, if relevant)
        const minCost = this.getAdjustedCost(context);

        return context.player.readyResourceCount >= minCost;
    }

    public resolve(context: AbilityContext<TCard>, result: ICostResult): void {
        const availableResources = context.player.readyResourceCount;
        const adjustedCost = this.getAdjustedCost(context);
        if (adjustedCost > availableResources) {
            result.cancelled = true;
            return;
        }
    }

    /**
     * Checks if any Cost Adjusters on the relevant player apply to the passed card/target, and returns the cost if they are used.
     * Accounts for aspect penalties and any modifiers to those specifically
     * @param cost
     * @param context
     * @param properties Additional parameters for determining cost adjustment
     */
    public getAdjustedCost(context: AbilityContext<TCard>): number {
        return this.runAdjustersForCost(this.resources, context.source, context);
    }

    public queueGenerateEventGameSteps(events: GameEvent[], context: AbilityContext<TCard>, result: ICostResult) {
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

    protected getExhaustResourceEvent(context: AbilityContext<TCard>): GameEvent {
        return new GameEvent(EventName.OnExhaustResources, context, { amount: this.getAdjustedCost(context) }, (event) => {
            const amount = this.getAdjustedCost(context);
            context.costs.resources = amount;

            event.context.player.markUsedAdjusters(context.playType, event.context.source, context, event.context.target);
            const priorityExhaustList = [];

            // For Smuggle and Plot, we need to ensure that the card being played is switched to being exhausted first, and then used as a priority pay resource
            if (context.playType === PlayType.Smuggle || context.playType === PlayType.Plot) {
                if (event.context.source.canBeExhausted() && !event.context.source.exhausted) {
                    priorityExhaustList.push(event.context.source);
                }
            }
            event.context.player.exhaustResources(amount, priorityExhaustList);

            if (this.afterPayHook) {
                this.afterPayHook(event);
            }
        });
    }

    /**
     * Runs the Adjusters for a specific cost type - either base cost or an aspect penalty - and returns the modified result
     * @param baseCost
     * @param card
     * @param target
     * @param properties Additional parameters for determining cost adjustment
     */
    protected runAdjustersForCost(baseCost: number, card, context, properties: IRunCostAdjustmentProperties = {}) {
        const matchingAdjusters = this.getMatchingCostAdjusters(context, properties);
        const costIncreases = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.Increase)
            .reduce((cost, adjuster) => cost + adjuster.getAmount(card, context.player, context), 0);
        const costDecreases = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.Decrease)
            .reduce((cost, adjuster) => cost + adjuster.getAmount(card, context.player, context), 0);

        baseCost += costIncreases;
        let reducedCost = baseCost - costDecreases;

        if (matchingAdjusters.some((adjuster) => adjuster.costAdjustType === CostAdjustType.Free)) {
            reducedCost = 0;
        }

        // run any cost adjusters that affect the "pay costs" stage last
        const payStageAdjustment = matchingAdjusters
            .filter((adjuster) => adjuster.costAdjustType === CostAdjustType.ModifyPayStage)
            .reduce((cost, adjuster) => cost + adjuster.getAmount(card, context.player, context, reducedCost), 0);

        reducedCost += payStageAdjustment;

        return Math.max(reducedCost, 0);
    }


    /**
     * @param context
     * @param properties Additional parameters for determining cost adjustment
     */
    protected getMatchingCostAdjusters(context: AbilityContext, properties: IGetMatchingCostAdjusterProperties = null): CostAdjuster[] {
        const canAdjustProps: ICanAdjustProperties = { ...properties, isAbilityCost: !context.ability.isPlayCardAbility() };
        const allAdjusters = context.player.getCostAdjusters().concat(properties?.additionalCostAdjusters ?? []);

        if (context.stage === Stage.Cost && !context.target && context.source.isUpgrade()) {
            return this.getMatchingCostAdjustersForUpgrade(context, context.source, allAdjusters, canAdjustProps);
        }

        const matchingAdjusters: CostAdjuster[] = [];
        for (const adjuster of allAdjusters) {
            if (adjuster.canAdjust(context.source, context, { attachTarget: context.target, ...canAdjustProps })) {
                matchingAdjusters.push(adjuster);
            }
        }
        return matchingAdjusters;
    }

    private getMatchingCostAdjustersForUpgrade(context: AbilityContext, upgrade: IUpgradeCard, allAdjusters: CostAdjuster[], properties: ICanAdjustProperties): CostAdjuster[] {
        const matchingAdjusters: CostAdjuster[] = [];
        for (const adjuster of allAdjusters) {
            for (const unit of context.game.getArenaUnits()) {
                if (
                    upgrade.canAttach(unit, context, context.player) &&
                    adjuster.canAdjust(upgrade, context, { attachTarget: unit, ...properties })
                ) {
                    matchingAdjusters.push(adjuster);
                    break;
                }
            }
        }
        return matchingAdjusters;
    }
}
