import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, PlayType } from '../core/Constants';
import type { ICost, ICostResult } from '../core/cost/ICost';
import { GameEvent } from '../core/event/GameEvent';
import * as Contract from '../core/utils/Contract.js';
import { type CostAdjuster } from '../core/cost/CostAdjuster';
import type { Card } from '../core/card/Card';
import type { ICostAdjustmentProperties, ICostAdjustTriggerResult } from '../core/cost/CostInterfaces';
import { CostAdjustStage, ResourceCostType, type ICostAdjustEvaluationResult } from '../core/cost/CostInterfaces';
import * as CostHelpers from '../core/cost/CostHelpers';
import type { MetaActionCost } from '../core/cost/MetaActionCost';

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

    public isMetaActionCost(): this is MetaActionCost {
        return false;
    }

    public getName(): string {
        return 'resourceCost';
    }

    public canPay(context: AbilityContext<TCard>): boolean {
        // get the minimum cost we could possibly pay for this card to see if we have the resources available
        // (aspect penalty is included in this calculation, if relevant)
        const minCost = this.getAdjustedCost(context);

        return context.player.readyResourceCount >= minCost;
    }

    public resolve(context: AbilityContext<TCard>, abilityCostResult: ICostResult): void {
        Contract.assertIsNullLike(abilityCostResult.costAdjustments, 'Expected cost adjustment results to be null before resolving ResourceCost');

        const costAdjustmentEvaluation = this.resolveCostAdjustments(context);

        const availableResources = context.player.readyResourceCount;
        if (costAdjustmentEvaluation.remainingCost > availableResources) {
            abilityCostResult.cancelled = true;
        } else {
            abilityCostResult.costAdjustments = costAdjustmentEvaluation;
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
        const evaluationResult = this.resolveCostAdjustments(context);
        return evaluationResult.remainingCost;
    }

    protected resolveCostAdjustments(context: AbilityContext<TCard>): ICostAdjustEvaluationResult {
        const adjustersByStage = this.getCostAdjustersByStage(context);

        const evaluationResult: ICostAdjustEvaluationResult = this.initializeEvaluationResult(context, adjustersByStage);

        for (const stage of CostHelpers.getCostAdjustStagesInEvaluationOrder()) {
            evaluationResult.adjustStage = stage;
            evaluationResult.adjustersToTrigger.set(stage, []);

            const adjustersForStage = adjustersByStage.get(stage);

            for (const costAdjuster of adjustersForStage) {
                costAdjuster.resolveCostAdjustment(context.source, context, evaluationResult);
            }
        }

        return evaluationResult;
    }

    public queueGenerateEventGameSteps(events: GameEvent[], context: AbilityContext<TCard>, abilityCostResult: ICostResult) {
        Contract.assertNotNullLike(abilityCostResult.costAdjustments, 'Expected cost adjustment results to be populated before generating ResourceCost events');

        const costAdjustTriggerResult = this.initializeTriggerResult(abilityCostResult.costAdjustments);
        const remainingStages = CostHelpers.getCostAdjustStagesInTriggerOrder();

        this.triggerNextAdjustmentStages(context, costAdjustTriggerResult, abilityCostResult, remainingStages);

        const usedAdjusters: CostAdjuster[] = Array.from(costAdjustTriggerResult.adjustersToTrigger.values()).flat();
        context.game.queueSimpleStep(() => {
            if (!abilityCostResult.cancelled) {
                events.push(this.getExhaustResourceEvent(context, usedAdjusters));
            }
        }, `generate exhaust resources event for ${context.source.internalName}`);
    }

    protected triggerNextAdjustmentStages(context: AbilityContext<TCard>, triggerResult: ICostAdjustTriggerResult, abilityCostResult: ICostResult, remainingStages: CostAdjustStage[]) {
        if (remainingStages.length === 0 || abilityCostResult.cancelled) {
            return;
        }

        const remainingStagesCopy = [...remainingStages];

        let currentStage = remainingStagesCopy.shift();
        while (currentStage) {
            triggerResult.adjustStage = currentStage;
            const adjustersForStage = triggerResult.adjustersToTrigger.get(currentStage);

            // if there are targeted adjusters, stop and queue the steps for the player to choose targets
            if (CostHelpers.isTargetedCostAdjusterStage(currentStage) && adjustersForStage.length > 0) {
                this.queueStepsForTargetedAdjusterStage(context, triggerResult, abilityCostResult, currentStage);
                context.game.queueSimpleStep(() => this.triggerNextAdjustmentStages(context, triggerResult, abilityCostResult, remainingStagesCopy), 'continue cost adjustment stages');
                return;
            }

            // otherwise, just iterate over the adjusters for this stage and apply them to the value
            for (const adjuster of adjustersForStage) {
                adjuster.applyMaxAdjustmentAmount(context.source, context, triggerResult);
            }

            currentStage = remainingStagesCopy.shift();
        }
    }

    private queueStepsForTargetedAdjusterStage(
        context: AbilityContext<TCard>,
        triggerResult: ICostAdjustTriggerResult,
        abilityCostResult: ICostResult,
        currentStage: CostAdjustStage
    ) {
        const adjustersForStage = abilityCostResult.costAdjustments.adjustersToTrigger.get(currentStage);
        Contract.assertArraySize(adjustersForStage, 1, `Expected exactly one cost adjuster at stage ${CostAdjustStage[currentStage]}`);

        const adjuster = adjustersForStage[0];
        const adjustEvents = [];

        adjuster.queueGenerateEventGameSteps(adjustEvents, context, triggerResult, abilityCostResult);
        context.game.queueSimpleStep(() => context.game.openEventWindow(adjustEvents), 'resolve events for cost adjsuter');
    }

    protected initializeEvaluationResult(
        _context: AbilityContext<TCard>,
        _costAdjustersByStage: Map<CostAdjustStage, CostAdjuster[]>
    ): ICostAdjustEvaluationResult {
        return {
            totalResourceCost: this.resources,
            remainingCost: this.resources,
            adjustStage: CostAdjustStage.Increase_4,
            adjustersToTrigger: new Map<CostAdjustStage, CostAdjuster[]>(),
            resourceCostType: this.isPlayCost ? ResourceCostType.PlayCard : ResourceCostType.Ability
        };
    }

    protected initializeTriggerResult(evaluationResult: ICostAdjustmentProperties): ICostAdjustTriggerResult {
        return {
            totalResourceCost: evaluationResult.totalResourceCost,
            remainingCost: evaluationResult.totalResourceCost,
            adjustStage: CostAdjustStage.Standard_0,
            adjustersToTrigger: evaluationResult.adjustersToTrigger,
            resourceCostType: evaluationResult.resourceCostType
        };
    }

    protected getCostAdjustersByStage(context: AbilityContext, additionalCostAdjusters: CostAdjuster[] = null): Map<CostAdjustStage, CostAdjuster[]> {
        const allAdjusters = context.player.getCostAdjusters().concat(additionalCostAdjusters ?? []);

        const adjustersByStage: Map<CostAdjustStage, CostAdjuster[]> = new Map<CostAdjustStage, CostAdjuster[]>(
            CostHelpers.getCostAdjustStagesInEvaluationOrder().map((stage) => [stage, [] as CostAdjuster[]])
        );

        for (const adjuster of allAdjusters) {
            adjustersByStage.get(adjuster.costAdjustStage).push(adjuster);
        }

        return adjustersByStage;
    }

    protected getExhaustResourceEvent(context: AbilityContext<TCard>, usedAdjusters: CostAdjuster[]): GameEvent {
        return new GameEvent(EventName.OnExhaustResources, context, { amount: this.getAdjustedCost(context) }, (event) => {
            const amount = this.getAdjustedCost(context);
            context.costs.resources = amount;

            for (const adjuster of usedAdjusters) {
                adjuster.markUsed();
                if (adjuster.isExpired()) {
                    context.player.removeCostAdjuster(adjuster);
                }
            }

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
}
