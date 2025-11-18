import type { AbilityContext } from '../ability/AbilityContext';
import { CardTargetResolver } from '../ability/abilityTargets/CardTargetResolver';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { RelativePlayer, TargetMode, WildcardCardType, type EventName } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type Game from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import type { ITargetedCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjuster } from './CostAdjuster';
import type { CostAdjustStage, IAbilityCostAdjustmentProperties, ICostAdjustEvaluationIntermediateResult, ICostAdjustEvaluationResult, ICostAdjustResult, ICostAdjustTriggerResult, IEvaluationOpportunityCost } from './CostInterfaces';
import type { ICostResult } from './ICost';

export type ITargetedCostAdjusterInitializationProperties = ITargetedCostAdjusterProperties & {
    targetCondition?: (card: IUnitCard, context: AbilityContext) => boolean;
    doNotUseAdjusterButtonText: string;
    costPropertyName: string;
    useAdjusterButtonText: string;
    adjustAmountPerTarget: number;
    eventName: EventName;
    promptSuffix: string;
    maxTargetCount?: number;
};

interface IContextCostProps {
    minimumTargets?: number;
    selectedTargets?: IUnitCard[];

    /**
     * This is statically computed and available only if opportunity cost isn't relevant,
     * since otherwise the other discount amounts are not fixed
     */
    remainingCostAfterOtherDiscounts?: number;

    /** This will only be computed and stored if opportunity costs matter */
    sortedAvailableTargets?: IOpportunityCostTarget[];
}

interface IOpportunityCostTarget {
    unit: IUnitCard;
    opportunityCost: IEvaluationOpportunityCost;
}

/**
 * ABC for cost adjusters that adjust cost based on targeted units (Exploit and Vuutun Palaa).
 * Centralizes all of the common functionality including determining required number of targets,
 * building the target resolver and evaluating which selection are legal based on downstream adjusters,
 * and evaluating whether there is sufficient available adjustment to pay.
 */
export abstract class TargetedCostAdjuster extends CostAdjuster {
    protected readonly adjustAmountPerTarget: number;
    protected readonly costPropertyName: string;
    protected readonly doNotUseAdjusterButtonText: string;
    protected readonly effectSystem: GameSystem<AbilityContext<IUnitCard>>;
    protected readonly eventName: EventName;
    protected readonly maxTargetCount?: number;
    protected readonly promptSuffix: string;
    protected readonly useAdjusterButtonText: string;

    /**
     * This target resolver doesn't consider opportunity costs at the selection step.
     * Therefore it can be reused across multiple canPay evaluations for different cards, as well
     * as for selecting targets at pay time _if_ opportunity costs are not relevant to the adjustment.
     */
    protected readonly defaultTargetResolver: CardTargetResolver;

    protected readonly targetCondition?: (card: Card, context: AbilityContext) => boolean;

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        costStage: CostAdjustStage,
        properties: ITargetedCostAdjusterInitializationProperties
    ) {
        super(game, source, costStage, properties);

        this.adjustAmountPerTarget = properties.adjustAmountPerTarget;
        this.costPropertyName = properties.costPropertyName;
        this.useAdjusterButtonText = properties.useAdjusterButtonText;
        this.doNotUseAdjusterButtonText = properties.doNotUseAdjusterButtonText;
        this.eventName = properties.eventName;
        this.promptSuffix = properties.promptSuffix;
        this.maxTargetCount = properties.maxTargetCount;

        this.effectSystem = this.buildEffectSystem();
        this.targetCondition = properties.targetCondition;

        // cache this resolver so it can be reused across canPay checks for different cards
        this.defaultTargetResolver = this.buildEvaluationStageTargetResolver();
    }

    protected abstract buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>>;

    /** Allows us to bypass the opportunity cost evaluations when not needed, since they're fairly computationally expensive */
    protected abstract doesAdjustmentUseOpportunityCost(adjustmentProps: IAbilityCostAdjustmentProperties): boolean;

    public override isTargeted(): this is TargetedCostAdjuster {
        return true;
    }

    protected override canAdjust(card: Card, context: AbilityContext<ICardWithCostProperty>, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        // check available legal targets
        if (!this.defaultTargetResolver.hasLegalTarget(context)) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    public override getAmount(card: Card, player: Player, context: AbilityContext, currentAmount: number = null): number {
        return this.getNumberOfLegalTargets(this.defaultTargetResolver, context) * this.adjustAmountPerTarget;
    }

    /**
     * Triggers the target selection stage of the cost adjuster, where the user is prompted to select which units to
     * target for the effect.
     *
     * Handles the setup of the target resolver by determining the minimum number of targets required based on other
     * available adjustments, and populates the context with necessary data to be able to update the target list
     * on the fly based on player selections.
     */
    public queueGenerateEventGameSteps(
        events: any[],
        context: AbilityContext<Card>,
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        abilityCostResult?: ICostResult
    ) {
        Contract.assertIsNullLike(context.costs[this.costPropertyName]);

        if (this.isCancelled) {
            return;
        }

        const useOpportunityCost = this.doesAdjustmentUseOpportunityCost(abilityCostResult.costAdjustments);

        const sortedTargetsWithOpportunityCost = this.buildSortedTargets(abilityCostResult.costAdjustments, context);

        const remainingCostAfterOtherDiscounts =
            useOpportunityCost
                ? null
                : this.getMinimumPossibleRemainingCost(context, costAdjustTriggerResult);

        const costProps: IContextCostProps = {
            sortedAvailableTargets: useOpportunityCost ? sortedTargetsWithOpportunityCost : null,
            remainingCostAfterOtherDiscounts
        };
        context.costs[this.costPropertyName] = costProps;

        this.checkAddAdjusterToTriggerList(context.source, costAdjustTriggerResult);

        const targetResolver = useOpportunityCost
            ? this.buildTriggerStageTargetResolver(costAdjustTriggerResult, context)
            : this.defaultTargetResolver;

        const minimumTargetsSet = this.findMinimumTargetSetToPay(
            sortedTargetsWithOpportunityCost.map((t) => t.unit),
            context,
            costAdjustTriggerResult,
            context.player.readyResourceCount,
        );

        Contract.assertNotNullLike(minimumTargetsSet, 'No valid target set found to pay cost with targeted cost adjuster at pay time');
        const minimumTargetsRequiredToPay = minimumTargetsSet.length;

        const maxTargetableUnitsCount = this.getNumberOfLegalTargets(targetResolver, context);
        costProps.minimumTargets = Math.max(1, minimumTargetsRequiredToPay);

        // payment shouldn't have been triggered if there aren't enough targetable units available to pay the minimum
        Contract.assertTrue(maxTargetableUnitsCount >= minimumTargetsRequiredToPay);

        // if no targetable units, shortcut past target prompt
        if (maxTargetableUnitsCount === 0) {
            return;
        }

        const canPlayWithoutAdjuster = minimumTargetsRequiredToPay === 0;

        // TODO: once we have a real cancel flow, enable cancel here in the case of a card being played via another card's ability
        // if using the adjuster is the only option that would be shown, just go directly to target selection
        if (!abilityCostResult.canCancel && !canPlayWithoutAdjuster) {
            this.triggerAdjustment(events, context, costAdjustTriggerResult, abilityCostResult, targetResolver);
            return;
        }

        const choices = [this.useAdjusterButtonText];
        const handlers = [
            () => this.triggerAdjustment(events, context, costAdjustTriggerResult, abilityCostResult, targetResolver)
        ];

        if (abilityCostResult.canCancel) {
            choices.push('Cancel');
            handlers.push(() => {
                abilityCostResult.cancelled = true;
            });
        }

        // add normal play option if available
        if (canPlayWithoutAdjuster) {
            choices.unshift(this.doNotUseAdjusterButtonText);
            handlers.unshift(() => undefined);
        }

        context.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: `Choose pay mode for ${context.source.title}`,
            choices,
            handlers
        });
    }

    /** Applies the maximum possible adjustment amount based on the number of legal targets minus any targets that would be potentially removed by earlier stages (i.e. Exploit) */
    protected override applyMaxAdjustmentAmount(_card: Card, context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]) {
        const numRemovedTargets = previousTargetSelections ? this.getNumberOfRemovedTargets(previousTargetSelections, context) : 0;

        const adjustAmount = (this.getNumberOfLegalTargets(this.defaultTargetResolver, context) - numRemovedTargets) * this.adjustAmountPerTarget;
        result.adjustedCost.applyStaticDecrease(adjustAmount);
    }

    /** If the cost would be affected by targets being removed by Exploit, returns the number of targets removed */
    protected getNumberOfRemovedTargets(previousTargetSelections: ITriggerStageTargetSelection[], context: AbilityContext): number {
        return 0;
    }

    /**
     * Determines the minimum possible cost to play by iterating over the list of targetable units and calculating the max discount available for each.
     * This includes evaluating the "opportunity cost" if there is an interaction like Exploit removing a droid while Vuutun Palaa is in play.
     */
    protected override resolveCostAdjustmentInternal(_card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        const targets = this.buildSortedTargets(evaluationResult, context);
        const numTargets = Math.min(targets.length, this.getNumberOfLegalTargets(this.defaultTargetResolver, context));

        for (let i = 0; i < numTargets; i++) {
            const opportunityCost = targets[i].opportunityCost;

            // if there is a "dynamic" opportunity cost like Starhawk, add tracking context here indicating that we have the option
            // to keep it in play or to target it for our effect (currently always Exploit)
            if (opportunityCost.dynamic != null) {
                opportunityCost.dynamic.addAlternateDiscount(this.adjustAmountPerTarget);
                continue;
            }

            const fixedOpportunityCost = opportunityCost.max;
            if (fixedOpportunityCost >= this.adjustAmountPerTarget) {
                continue;
            }

            evaluationResult.adjustedCost.applyStaticDecrease(this.adjustAmountPerTarget - fixedOpportunityCost);
        }
    }

    /**
     * Builds the list of legal targets in the arena that could be selected for this effect, ordered in increasing order of "opportunity cost".
     * The idea is that we will greedily evaluate units with lower opportunity cost first to get the highest possible overall discount.
     */
    protected buildSortedTargets(result: ICostAdjustEvaluationResult, context: AbilityContext): IOpportunityCostTarget[] {
        const targets: IOpportunityCostTarget[] = [];

        for (const { unit, opportunityCost: opportunityCostMap } of result.costAdjusterTargets) {
            if (this.targetCondition && !this.targetCondition(unit, context)) {
                continue;
            }

            const opportunityCost = opportunityCostMap?.get(this.costAdjustStage) ?? { max: 0 };

            targets.push({ unit, opportunityCost });
        }

        targets.sort((a, b) => a.opportunityCost.max - b.opportunityCost.max);

        return targets;
    }

    /**
     * At pay time, computes the smallest set of targets we could choose at this stage which will allow paying the full cost.
     * This accounts for both "upstream" adjustments that have already been applied, as well as "downstream" adjustments that might
     * be available depending on what choices we make (mostly relevant for Exploit).
     */
    private findMinimumTargetSetToPay(
        allAvailableTargetsSorted: Card[],
        context: AbilityContext,
        adjustResult: ICostAdjustTriggerResult,
        availableResources: number,
        preSelectedTargets?: Card[]
    ): Card[] | null {
        const availableCopy = [...allAvailableTargetsSorted];

        const potentialTargetSet: ITriggerStageTargetSelection[] = [];
        const preselectedTargetSet = new Set<Card>();
        for (const card of preSelectedTargets ?? []) {
            potentialTargetSet.push({ card, stage: this.costAdjustStage });
            preselectedTargetSet.add(card);
        }

        const maxTargetableConcrete = this.maxTargetCount ?? availableCopy.length;
        const staticRemainingCostAfterOtherAdjustments =
            context.costs[this.costPropertyName]?.remainingCostAfterOtherDiscounts;

        do {
            const adjustAmountForTargetSet = potentialTargetSet.length * this.adjustAmountPerTarget;

            // small optimization: if we're not using opportunity costs, we can use the precomputed discounts from other adjusters
            // instead of re-running the downstream adjusters for every addition to the target set
            let minimumPossibleRemainingCost: number;
            if (staticRemainingCostAfterOtherAdjustments != null) {
                minimumPossibleRemainingCost = Math.max(0, staticRemainingCostAfterOtherAdjustments - adjustAmountForTargetSet);
            } else {
                minimumPossibleRemainingCost =
                    this.getMinimumPossibleRemainingCost(context, adjustResult, adjustAmountForTargetSet, potentialTargetSet);
            }

            if (minimumPossibleRemainingCost <= availableResources) {
                return potentialTargetSet.map((selection) => selection.card);
            }

            let nextCard: Card;
            do {
                nextCard = availableCopy.shift();
                if (!nextCard) {
                    return null;
                }
            } while (preselectedTargetSet.has(nextCard));

            potentialTargetSet.push({ card: nextCard, stage: this.costAdjustStage });
        } while (potentialTargetSet.length <= maxTargetableConcrete);

        return null;
    }

    /**
     * Triggers the process of the player choosing targets for adjustment, and then queues a followup step to trigger the event and make
     * the game state changes. Will check to see if the user cancels at the trigger stage.
     */
    private triggerAdjustment(
        events: any[],
        context: AbilityContext,
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        abilityCostResult: ICostResult,
        targetResolver: CardTargetResolver
    ) {
        // step 1: ask player to choose targets
        targetResolver.resolve(context, abilityCostResult);

        // step 2: generate the cost reduction event (which in turn emits the individual events for each targeted unit)
        context.game.queueSimpleStep(() => {
            if (!abilityCostResult.cancelled) {
                abilityCostResult.canCancel = false;
                costAdjustTriggerResult.adjustedCost.applyStaticDecrease(this.getSelectedUnitsCount(context) * this.adjustAmountPerTarget);
                events.push(this.buildTargetsEffectEvent(context));
            }
        }, `generate ${this.costPropertyName} event for ${context.source.internalName}`);
    }

    /**
     * Builds the GameEvents to apply the cost adjustment effects to the selected targets.
     * There will be one "overall" adjustment event and an effect for each individual target (i.e. defeat, exhaust).
     */
    private buildTargetsEffectEvent(context) {
        const costProps = context.costs[this.costPropertyName] as IContextCostProps;
        const targets = context.targets[this.costPropertyName];

        Contract.assertNotNullLike(targets);
        Contract.assertNotNullLike(costProps);
        Contract.assertIsNullLike(costProps.selectedTargets);

        const targetEffectEvents = [];
        costProps.selectedTargets = [];

        const selectedTargets = Helpers.asArray(targets);

        // create the events for the effect on the targeted units
        for (const targetUnit of selectedTargets) {
            targetEffectEvents.push(this.effectSystem.generateRetargetedEvent(targetUnit, context));
        }

        // create an event for the cost reduction operation itself, which will cache the "last known information"
        // of the targeted units (if available) in case it needs to be referred to by abilities
        const fullCostAdjustEffectEvent = new GameEvent(
            this.eventName,
            context,
            { units: selectedTargets },
            (_event) => {
                for (const targetEvent of targetEffectEvents) {
                    Contract.assertTrue(targetEvent.isResolvedOrReplacementResolved);

                    const targetCard = targetEvent.lastKnownInformation ?? targetEvent.card;
                    Contract.assertNotNullLike(targetCard, `Could not determine target card for adjuster of type ${this.costAdjustType} on event type ${targetEvent.name}`);

                    costProps.selectedTargets.push(targetEvent.lastKnownInformation ?? targetEvent.card);
                }
            }
        );

        // the cost reduction event will emit the target events as contingent events and resolve them in earlier order
        fullCostAdjustEffectEvent.setContingentEventsGenerator((event) => {
            for (const targetEvent of targetEffectEvents) {
                targetEvent.order = event.order - 1;
            }
            return [...targetEffectEvents];
        });

        return fullCostAdjustEffectEvent;
    }

    /** Builds a common reusable target resolver that can be applied across multiple potential target cards */
    private buildEvaluationStageTargetResolver(): CardTargetResolver {
        return this.buildTargetResolverCommon();
    }

    /**
     * Builds a dedicated target resolver for use when the card is being played and we need to evaluate which cards are legal for selection.
     * This resolver will update the set of selectable units based on which cards are already selected and what that implies for available downstream adjustments
     * (i.e., Exploit + Vuutun Palaa).
     */
    private buildTriggerStageTargetResolver(
        triggerResult: ICostAdjustTriggerResult,
        context: AbilityContext
    ): CardTargetResolver {
        const sortedTargets = this.getSortedTargetsFromContext(context).map((t) => t.unit);

        const multiSelectCardCondition = (card: Card, selectedCards: Card[], context?: AbilityContext) =>
            this.evaluateTargetable(
                card,
                selectedCards,
                context,
                sortedTargets,
                triggerResult
            );

        const onSelectionSetChanged = (selected: Card | Card[], context: AbilityContext) =>
            this.updateMinimumTargetsInContext(selected, triggerResult, context);

        return this.buildTargetResolverCommon(multiSelectCardCondition, onSelectionSetChanged);
    }

    private buildTargetResolverCommon(
        multiSelectCardCondition?: (card: Card, selectedCards: Card[], context?: AbilityContext) => boolean,
        onSelectionSetChanged?: (selectedCards: Card[], context: AbilityContext) => void,
    ): CardTargetResolver {
        const maxNumCardsFunc = this.maxTargetCount
            ? () => this.maxTargetCount
            : null;

        // TODO THIS PR: update prompt text for cases where minimum is variable
        return new CardTargetResolver(
            this.costPropertyName, {
                mode: TargetMode.BetweenVariable,
                minNumCardsFunc: (context) => context.costs[this.costPropertyName]?.minimumTargets ?? 1,
                maxNumCardsFunc,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: this.effectSystem,
                controller: RelativePlayer.Self,
                appendToDefaultTitle: this.promptSuffix,
                cardCondition: this.targetCondition,
                onSelectionSetChanged,
                multiSelectCardCondition
            }
        );
    }

    /** Updates the value on the context object indicating the current minimum number of targetable cards, based on the currently selected units */
    private updateMinimumTargetsInContext(
        selected: Card | Card[],
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        context: AbilityContext
    ) {
        const minimumTargetsSet = this.findMinimumTargetSetToPay(
            this.getSortedTargetsFromContext(context).map((t) => t.unit),
            context,
            costAdjustTriggerResult,
            context.player.readyResourceCount,
            Helpers.asArray(selected)
        );

        context.costs[this.costPropertyName].minimumTargets = minimumTargetsSet.length;
    }


    /**
     * Determines whether a specific unit on the field can be selected for the cost adjustment effect.
     * The big question is whether doing something to that unit (defeating it for Exploit) will impact other
     * downstream cost adjustments in a way where it would no longer be possible to pay. If so, the card is marked
     * as not selectable.
     *
     * This will change based on the current set of selections.
     */
    private evaluateTargetable(
        card: Card,
        selectedCards: Card[],
        context: AbilityContext,
        selectableCardsSorted: Card[],
        adjustResult: ICostAdjustTriggerResult
    ): boolean {
        const availableResources = context.player.readyResourceCount;
        const currentAdjustedCost = adjustResult.adjustedCost.value;

        const currentDiscountAmount = selectedCards.length * this.adjustAmountPerTarget;
        const remainingCostToPay = Math.max(0, currentAdjustedCost - currentDiscountAmount);

        if (remainingCostToPay <= availableResources) {
            return true;
        }

        const minimumTargetSetToPay = this.findMinimumTargetSetToPay(
            selectableCardsSorted,
            context,
            adjustResult,
            availableResources,
            [...selectedCards, card]
        );

        return minimumTargetSetToPay != null;
    }

    // by default, can choose as many targets as meet the condition
    protected getNumberOfLegalTargets(targetResolver: CardTargetResolver, context: AbilityContext) {
        const availableTargetsCount = targetResolver.getAllLegalTargets(context).length;

        return this.maxTargetCount == null
            ? availableTargetsCount
            : Math.min(this.maxTargetCount, availableTargetsCount);
    }

    private getSelectedUnitsCount(context: AbilityContext): number {
        return Helpers.asArray(context.targets[this.costPropertyName])?.length || 0;
    }

    private getSortedTargetsFromContext(context: AbilityContext): IOpportunityCostTarget[] {
        const costProps = context.costs[this.costPropertyName] as IContextCostProps;
        Contract.assertNotNullLike(costProps);
        Contract.assertNotNullLike(costProps.sortedAvailableTargets);

        return costProps.sortedAvailableTargets;
    }
}
