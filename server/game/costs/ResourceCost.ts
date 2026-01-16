import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, PlayType } from '../core/Constants';
import type { ICost, ICostResult } from '../core/cost/ICost';
import { GameEvent } from '../core/event/GameEvent';
import * as Contract from '../core/utils/Contract.js';
import { CostAdjustResolutionMode, type CostAdjuster } from '../core/cost/CostAdjuster';
import type { Card } from '../core/card/Card';
import type { IAbilityCostAdjustmentProperties, ICostAdjusterEvaluationTarget, ICostAdjustTriggerResult, ResourceCostType } from '../core/cost/CostInterfaces';
import { CostAdjustStage, type ICostAdjustEvaluationIntermediateResult } from '../core/cost/CostInterfaces';
import * as CostHelpers from '../core/cost/CostHelpers';
import type { MetaActionCost } from '../core/cost/MetaActionCost';
import { AdjustedCostEvaluator } from '../core/cost/evaluation/AdjustedCostEvaluator';
import { SimpleAdjustedCost } from '../core/cost/evaluation/SimpleAdjustedCost';
import type { Player } from '../core/Player';

/**
 * Represents the resource cost of playing a card. When calculated / paid, will account for
 * any cost adjusters in play that increase or decrease the play cost for the relevant card.
 */
export abstract class ResourceCost<TCard extends Card = Card> implements ICost<AbilityContext<TCard>> {
    public readonly resourceCostAmount: number;
    protected readonly payingPlayer: (context: AbilityContext) => Player;

    public constructor(
        resourceCostAmount: number,
        payingPlayer: (context: AbilityContext) => Player = (context) => context.player
    ) {
        this.resourceCostAmount = resourceCostAmount;
        this.payingPlayer = payingPlayer;
    }

    public abstract get resourceCostType(): ResourceCostType;

    public isResourceCost(): this is ResourceCost {
        return true;
    }

    public isMetaActionCost(): this is MetaActionCost {
        return false;
    }

    public getName(): string {
        return 'resourceCost';
    }

    /** Returns true if this.payer(context) has enough ready resources to pay the cost, accounting for adjustments */
    public canPay(context: AbilityContext<TCard>): boolean {
        const minCost = this.getAdjustedCost(context);
        return this.payingPlayer(context).readyResourceCount >= minCost;
    }

    /**
     * Works through the flow of all cost adjusters and builds up a {@link ICostAdjustEvaluationIntermediateResult} with information about the adjusters
     * that will be triggered and the final cost after all adjustments. This will be set as `abilityCostResult.costAdjustments` during resolution
     * if the cost can be paid.
     *
     * The same `abilityCostResult` parameter must be used when calling {@link queueGameStepsForAdjustmentsAndPayment} to pay the cost.
     *
     * If the cost cannot be paid, e.g. due to lack of resources, this will set `abilityCostResult.cancelled` to true.
     */
    public resolve(context: AbilityContext<TCard>, abilityCostResult: ICostResult): void {
        Contract.assertIsNullLike(abilityCostResult.costAdjustments, 'Expected cost adjustment results to be null before resolving ResourceCost');

        const costAdjustmentEvaluation = this.resolveCostAdjustments(context);

        const availableResources = this.payingPlayer(context).readyResourceCount;
        if (costAdjustmentEvaluation.adjustedCost.value > availableResources) {
            abilityCostResult.cancelled = true;
        } else {
            abilityCostResult.costAdjustments = costAdjustmentEvaluation;
        }
    }

    /** Returns the lowest possible cost that could be paid, accounting for all cost adjustments */
    public getAdjustedCost(context: AbilityContext<TCard>): number {
        const evaluationResult = this.resolveCostAdjustments(context);
        return evaluationResult.adjustedCost.value;
    }

    /**
     * Works through the flow of all cost adjusters and builds up a {@link ICostAdjustEvaluationIntermediateResult} with information about the adjusters
     * that will be triggered and the final cost after all adjustments.
     *
     * It will flow _backwards_ through the cost adjust stages so that latter stages can add information that earlier stages
     * can leverage for determining what the most cost-effective adjustments are (mostly relevant for Exploit).
     */
    protected resolveCostAdjustments(context: AbilityContext<TCard>): ICostAdjustEvaluationIntermediateResult {
        const adjustersByStage = this.getCostAdjustersByStage(context);

        const evaluationResult: ICostAdjustEvaluationIntermediateResult = this.initializeEvaluationResult(context, adjustersByStage);

        for (const stage of CostHelpers.getCostAdjustStagesInEvaluationOrder()) {
            evaluationResult.adjustStage = stage;
            evaluationResult.matchingAdjusters.set(stage, []);

            const adjustersForStage = adjustersByStage.get(stage);

            for (const costAdjuster of adjustersForStage) {
                costAdjuster.resolveCostAdjustment(context.source, context, evaluationResult);
            }
        }

        return evaluationResult;
    }

    /**
     * This method will apply all cost adjustments and pay the cost by exhausting resources. It will queue any necessary game steps.
     *
     * At a minimum, it will apply all non-targeted cost adjustments inline and then queue an event window to exhaust the
     * required resources. If there are any "targeted" adjusters (such as Exploit), it will first apply the standard adjusters,
     * then queue steps to have the player choose targets before continuing with remaining adjustments and payment.
     */
    public queueGameStepsForAdjustmentsAndPayment(events: GameEvent[], context: AbilityContext<TCard>, abilityCostResult: ICostResult) {
        Contract.assertNotNullLike(abilityCostResult.costAdjustments, 'Expected cost adjustment results to be populated before generating ResourceCost events');

        const costAdjustTriggerResult = this.initializeTriggerResult(abilityCostResult.costAdjustments);
        const remainingStages = CostHelpers.getCostAdjustStagesInTriggerOrder();

        this.triggerNextAdjustmentStages(context, costAdjustTriggerResult, abilityCostResult, remainingStages);

        context.game.queueSimpleStep(() => {
            if (!abilityCostResult.cancelled) {
                events.push(this.getExhaustResourceEvent(context, costAdjustTriggerResult));
            }
        }, `generate exhaust resources event for ${context.source.internalName}`);
    }

    /**
     * Iterates through the remaining cost adjustment stages in `remainingStages`. For each stage:
     * - If there are non-targeted adjusters at that stage, it will apply them and continue looping
     * - If there are targeted adjusters at that stage, it will queue steps for the player to choose targets and then
     * queue a recursive call to this method to continue processing
     */
    protected triggerNextAdjustmentStages(
        context: AbilityContext<TCard>,
        triggerResult: ICostAdjustTriggerResult,
        abilityCostResult: ICostResult,
        remainingStages: CostAdjustStage[]
    ) {
        if (remainingStages.length === 0 || abilityCostResult.cancelled) {
            return;
        }

        const remainingStagesCopy = [...remainingStages];

        let currentStage = remainingStagesCopy.shift();
        while (currentStage) {
            triggerResult.adjustStage = currentStage;
            const adjustersForStage = triggerResult.matchingAdjusters.get(currentStage);

            // if there are adjusters that require game steps, stop and queue them
            if (CostHelpers.isInteractiveCostAdjusterStage(currentStage) && adjustersForStage.length > 0) {
                this.queueStepsForInteractiveAdjusterStage(context, triggerResult, abilityCostResult, currentStage);
                context.game.queueSimpleStep(() => this.triggerNextAdjustmentStages(context, triggerResult, abilityCostResult, remainingStagesCopy), 'continue cost adjustment stages');
                return;
            }

            // otherwise, just iterate over the adjusters for this stage and apply them to the value
            for (const adjuster of adjustersForStage) {
                adjuster.checkApplyCostAdjustment(context.source, context, triggerResult);
            }

            currentStage = remainingStagesCopy.shift();
        }
    }

    /** Queues the steps for resolving a targeted cost adjuster such as Exploit */
    private queueStepsForInteractiveAdjusterStage(
        context: AbilityContext<TCard>,
        triggerResult: ICostAdjustTriggerResult,
        abilityCostResult: ICostResult,
        currentStage: CostAdjustStage
    ) {
        const adjustersForStage = abilityCostResult.costAdjustments.matchingAdjusters.get(currentStage);
        Contract.assertArraySize(adjustersForStage, 1, `Expected exactly one cost adjuster at stage ${CostAdjustStage[currentStage]}`);

        const adjuster = adjustersForStage[0];
        const adjustEvents = [];

        Contract.assertTrue(adjuster.requiresGameSteps(), `Expected cost adjuster at stage ${CostAdjustStage[currentStage]} to require game steps but it is of type '${adjuster.constructor.name}'`);
        adjuster.queueGenerateEventGameSteps(adjustEvents, context, triggerResult, abilityCostResult);
        context.game.queueSimpleStep(() => {
            context.game.openEventWindow(adjustEvents);
        }, 'resolve events for cost adjsuter');
    }

    /** Builds a new {@link ICostAdjustEvaluationIntermediateResult} for starting a resolve pass */
    protected initializeEvaluationResult(
        context: AbilityContext<TCard>,
        _costAdjustersByStage: Map<CostAdjustStage, CostAdjuster[]>
    ): ICostAdjustEvaluationIntermediateResult {
        const costAdjusterTargets: ICostAdjusterEvaluationTarget[] = this.payingPlayer(context).getArenaUnits()
            .map((unit) => ({ unit }));
        const costTracker = this.buildEvaluationCostTracker(context);

        return {
            resolutionMode: CostAdjustResolutionMode.Evaluate,
            getTotalResourceCost: (includeAspectPenalties) => costTracker.getTotalResourceCost(includeAspectPenalties),
            getPenaltyAspects: () => costTracker.penaltyAspects,
            adjustedCost: costTracker,
            adjustStage: CostAdjustStage.Increase_5,
            matchingAdjusters: new Map<CostAdjustStage, CostAdjuster[]>(),
            resourceCostType: this.resourceCostType,
            costAdjusterTargets,
        };
    }

    /** Builds a new {@link ICostAdjustTriggerResult} for starting an adjust + payment pass */
    protected initializeTriggerResult(evaluationResult: IAbilityCostAdjustmentProperties): ICostAdjustTriggerResult {
        const costTracker = new SimpleAdjustedCost(evaluationResult.getTotalResourceCost(false), evaluationResult.getPenaltyAspects());

        return {
            resolutionMode: CostAdjustResolutionMode.Trigger,
            getTotalResourceCost: (includeAspectPenalties) => costTracker.getTotalResourceCost(includeAspectPenalties),
            getPenaltyAspects: () => costTracker.penaltyAspects,
            adjustedCost: costTracker,
            adjustStage: CostAdjustStage.Standard_0,
            matchingAdjusters: evaluationResult.matchingAdjusters,
            resourceCostType: evaluationResult.resourceCostType,
            triggeredAdjusters: new Set<CostAdjuster>()
        };
    }

    protected buildEvaluationCostTracker(_context: AbilityContext): AdjustedCostEvaluator {
        return new AdjustedCostEvaluator(this.resourceCostAmount);
    }

    /** Constructs a map of all cost adjusters for a player + ability grouped by their stage */
    protected getCostAdjustersByStage(context: AbilityContext, additionalCostAdjusters: CostAdjuster[] = null): Map<CostAdjustStage, CostAdjuster[]> {
        const allAdjusters = this.payingPlayer(context).getCostAdjusters()
            .concat(additionalCostAdjusters ?? []);

        const adjustersByStage: Map<CostAdjustStage, CostAdjuster[]> = new Map<CostAdjustStage, CostAdjuster[]>(
            CostHelpers.getCostAdjustStagesInEvaluationOrder().map((stage) => [stage, [] as CostAdjuster[]])
        );

        for (const adjuster of allAdjusters) {
            adjustersByStage.get(adjuster.costAdjustStage).push(adjuster);
        }

        return adjustersByStage;
    }

    /** Builds an event to exhaust the remaining resources to pay the cost after adjustments have been applied */
    protected getExhaustResourceEvent(context: AbilityContext<TCard>, adjustResult: ICostAdjustTriggerResult): GameEvent {
        return new GameEvent(EventName.OnExhaustResources, context, { amount: this.getAdjustedCost(context) }, (event) => {
            const amount = adjustResult.adjustedCost.value;
            context.costs.resources = amount;

            const usedAdjusters: CostAdjuster[] = Array.from(adjustResult.triggeredAdjusters);
            for (const adjuster of usedAdjusters) {
                adjuster.markUsed();
                if (adjuster.isExpired()) {
                    this.payingPlayer(context).removeCostAdjuster(adjuster);
                }
            }

            const priorityExhaustList = [];

            // For Smuggle and Plot, we need to ensure that the card being played is switched to being exhausted first, and then used as a priority pay resource
            if (context.playType === PlayType.Smuggle || context.playType === PlayType.Plot) {
                if (event.context.source.canBeExhausted() && !event.context.source.exhausted) {
                    priorityExhaustList.push(event.context.source);
                }
            }

            this.payingPlayer(context).exhaustResources(amount, priorityExhaustList);
        });
    }
}
