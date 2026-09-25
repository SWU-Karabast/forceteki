import type { AbilityContext } from '../ability/AbilityContext';
import { CardTargetResolver } from '../ability/abilityTargets/CardTargetResolver';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { RelativePlayer, TargetMode, WildcardCardType, type CardTypeFilter, type EventName, type GameStateChangeRequired, type ZoneFilter } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type { Game } from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import { Helpers } from '../utils/Helpers';
import type { ITargetedCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjusterWithGameSteps } from './CostAdjusterWithGameSteps';
import type { CostAdjustStage, IAbilityCostAdjustmentProperties, ICostAdjustEvaluationIntermediateResult, ICostAdjustEvaluationResult, ICostAdjustResult, ICostAdjustTriggerResult, IEvaluationOpportunityCost } from './CostInterfaces';
import type { ICostResult } from './ICost';
import type { ICardTargetsResolver } from '../../TargetInterfaces';

import { registerStateBase } from '../GameObjectUtils';

export type ITargetedCostAdjusterInitializationProperties = ITargetedCostAdjusterProperties & {
    targetCondition?: (card: Card, context: AbilityContext) => boolean;
    costPropertyName: string;

    /** Button text for the pay mode prompt. Only required if the adjuster uses the pay mode prompt. */
    useAdjusterButtonText?: string;
    doNotUseAdjusterButtonText?: string;
    adjustAmountPerTarget: number;
    eventName: EventName;
    promptSuffix: string;

    /** Maximum number of targets that can be selected. Defaults to unlimited. */
    maxTargetCount?: number | ((context: AbilityContext) => number);

    /** Card type filter for selectable targets. Defaults to units. */
    targetCardTypeFilter?: CardTypeFilter;

    /** Zone filter for selectable targets. Defaults to the target resolver's default (arena units). */
    targetZoneFilter?: ZoneFilter;

    /**
     * Game state change requirement for selectable targets. Set to `MustFullyResolve` when targets come from a zone hidden
     * from the opponent, since otherwise the target resolver will always allow choosing nothing (see SWU Comp Rules 1.17.4).
     */
    targetMustChangeGameState?: GameStateChangeRequired;
};

interface IContextCostProps {
    minimumTargets?: number;
    selectedTargets?: Card[];

    /**
     * This is statically computed and available only if opportunity cost isn't relevant,
     * since otherwise the other discount amounts are not fixed
     */
    remainingCostAfterOtherDiscounts?: number;

    /** These will only be computed and stored if opportunity costs matter */
    sortedAvailableTargets?: IOpportunityCostTarget[];
    otherDiscountsAmount?: number;
}

export interface IOpportunityCostTarget {
    card: Card;
    opportunityCost: IEvaluationOpportunityCost;
}

/**
 * ABC for cost adjusters that adjust cost based on targeted units (Exploit and Vuutun Palaa).
 * Centralizes all of the common functionality including determining required number of targets,
 * building the target resolver and evaluating which selection are legal based on downstream adjusters,
 * and evaluating whether there is sufficient available adjustment to pay.
 */
@registerStateBase()
export abstract class TargetedCostAdjuster extends CostAdjusterWithGameSteps {
    protected readonly adjustAmountPerTarget: number;
    protected readonly costPropertyName: string;
    protected readonly doNotUseAdjusterButtonText: string;
    protected readonly effectSystem: GameSystem<AbilityContext<IUnitCard>>;
    protected readonly eventName: EventName;
    protected readonly maxTargetCount?: number | ((context: AbilityContext) => number);
    protected readonly promptSuffix: string;
    protected readonly targetCardTypeFilter: CardTypeFilter;
    protected readonly targetZoneFilter?: ZoneFilter;
    protected readonly targetMustChangeGameState?: GameStateChangeRequired;
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
        this.targetCardTypeFilter = properties.targetCardTypeFilter ?? WildcardCardType.Unit;
        this.targetZoneFilter = properties.targetZoneFilter;
        this.targetMustChangeGameState = properties.targetMustChangeGameState;

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
     * target for the effect. Handles the setup of the target resolver by determining the minimum number of targets required based on other
     * available adjustments.
     *
     * If opportunity costs are relevant for this adjustment, they will be factored in since downstream discounts
     * can change on the based on player selections.
     */
    public override queueGenerateEventGameSteps(
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
                : this.getStaticRemainingCostAfterOtherDiscounts(context, costAdjustTriggerResult);

        const costProps: IContextCostProps = {
            sortedAvailableTargets: useOpportunityCost ? sortedTargetsWithOpportunityCost : null,
            remainingCostAfterOtherDiscounts
        };
        context.costs[this.costPropertyName] = costProps;

        this.checkAddAdjusterToTriggerList(context.source, costAdjustTriggerResult);

        const minimumTargetsSet = this.findMinimumTargetSetToPay(
            sortedTargetsWithOpportunityCost.map((t) => t.card),
            context,
            costAdjustTriggerResult,
            this.getPayingPlayer(context).readyResourceCount,
        )?.targetSet;

        Contract.assertNotNullLike(minimumTargetsSet, 'No valid target set found to pay cost with targeted cost adjuster at pay time');
        const minimumTargetsRequiredToPay = minimumTargetsSet.length;

        // without a pay mode prompt, the player goes directly to target selection and may choose nothing if no targets are required
        const usePayModePrompt = this.usesPayModePrompt();
        const canChooseNoTargets = !usePayModePrompt && minimumTargetsRequiredToPay === 0;

        let targetResolver: CardTargetResolver;
        if (useOpportunityCost) {
            targetResolver = this.buildOpportunityCostTriggerStageTargetResolver(costAdjustTriggerResult, context, canChooseNoTargets);
        } else if (canChooseNoTargets) {
            targetResolver = this.buildTargetResolverCommon(undefined, undefined, undefined, costAdjustTriggerResult, true);
        } else {
            targetResolver = this.defaultTargetResolver;
        }

        const maxTargetableUnitsCount = this.getNumberOfLegalTargets(targetResolver, context, costAdjustTriggerResult);
        costProps.minimumTargets = usePayModePrompt
            ? Math.max(1, minimumTargetsRequiredToPay)
            : minimumTargetsRequiredToPay;

        // payment shouldn't have been triggered if there aren't enough targetable units available to pay the minimum
        Contract.assertTrue(maxTargetableUnitsCount >= minimumTargetsRequiredToPay);

        // if no targetable units, shortcut past target prompt
        if (maxTargetableUnitsCount === 0) {
            return;
        }

        if (!usePayModePrompt) {
            this.triggerAdjustment(events, context, costAdjustTriggerResult, abilityCostResult, targetResolver);
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

        context.game.promptWithHandlerMenu(this.getPayingPlayer(context), {
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

            targets.push({ card: unit, opportunityCost });
        }

        targets.sort((a, b) => a.opportunityCost.max - b.opportunityCost.max);

        return targets;
    }

    /**
     * At pay time, computes the smallest set of targets we could choose at this stage which will allow paying the full cost.
     * This accounts for both "upstream" adjustments that have already been applied, as well as "downstream" adjustments.
     *
     * If opportunity costs are relevant for this adjustment, they will be factored in since the discount will depend
     * on what choices we make (mostly relevant for Exploit). Otherwise, the computation will be optimized for something simpler.
     */
    private findMinimumTargetSetToPay(
        allAvailableTargetsSorted: Card[],
        context: AbilityContext,
        adjustResult: ICostAdjustTriggerResult,
        availableResources: number,
        preSelectedTargets?: Card[]
    ): { targetSet: Card[]; otherDiscountsAmount: number } | null {
        const availableCopy = [...allAvailableTargetsSorted];

        const potentialTargetSet: ITriggerStageTargetSelection[] = [];
        const preselectedTargetSet = new Set<Card>();
        for (const card of preSelectedTargets ?? []) {
            potentialTargetSet.push({ card, stage: this.costAdjustStage });
            preselectedTargetSet.add(card);
        }

        const maxTargetableConcrete = this.getMaxTargetCount(context, adjustResult) ?? availableCopy.length;
        const staticRemainingCostAfterOtherAdjustments =
            context.costs[this.costPropertyName]?.remainingCostAfterOtherDiscounts;

        do {
            const adjustAmountForTargetSet = potentialTargetSet.length * this.adjustAmountPerTarget;

            // small optimization: if we're not using opportunity costs, we can use the precomputed discounts from other adjusters
            // instead of re-running the downstream adjusters for every addition to the target set
            let minimumPossibleRemainingCost: number;
            let requiredReadyResources: number;
            if (staticRemainingCostAfterOtherAdjustments != null) {
                minimumPossibleRemainingCost = Math.max(0, staticRemainingCostAfterOtherAdjustments - adjustAmountForTargetSet);
                requiredReadyResources = minimumPossibleRemainingCost;
            } else {
                const simulatedCost = this.simulateRemainingAdjustments(context, adjustResult, adjustAmountForTargetSet, potentialTargetSet);
                minimumPossibleRemainingCost = simulatedCost.value;
                requiredReadyResources = simulatedCost.requiredReadyResources;
            }

            // account for any ready resources consumed by the targets of this adjuster itself
            requiredReadyResources += this.getResourcesConsumedByTargets(potentialTargetSet.length, context);

            if (requiredReadyResources <= availableResources) {
                const otherDiscountsAmount = (adjustResult.getTotalResourceCost() - minimumPossibleRemainingCost) - adjustAmountForTargetSet;
                return { targetSet: potentialTargetSet.map((selection) => selection.card), otherDiscountsAmount };
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
                const selectedCount = this.getSelectedUnitsCount(context);

                // player chose not to select any targets
                if (selectedCount === 0) {
                    return;
                }

                this.onTargetsSelected(Helpers.asArray(context.targets[this.costPropertyName] ?? []), costAdjustTriggerResult, context);
                costAdjustTriggerResult.adjustedCost.applyStaticDecrease(selectedCount * this.adjustAmountPerTarget);
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
     * Builds a dedicated target resolver for use when the card is being played and we need to evaluate which cards are legal for selection,
     * with considerations for opportunity costs. This resolver will update the set of selectable units based on which cards are already
     * selected and what that implies for available downstream adjustments (i.e., Exploit + Vuutun Palaa).
     *
     * Should not be used if opportunity costs are not relevant, since it does a lot of extra  computation across all targets.
     */
    private buildOpportunityCostTriggerStageTargetResolver(
        triggerResult: ICostAdjustTriggerResult,
        context: AbilityContext,
        canChooseNoTargets: boolean
    ): CardTargetResolver {
        const sortedTargets = this.getSortedTargetsFromContext(context).map((t) => t.card);

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

        const activePromptTitle = this.buildActivePromptTitleHandler(triggerResult);

        return this.buildTargetResolverCommon(multiSelectCardCondition, onSelectionSetChanged, activePromptTitle, triggerResult, canChooseNoTargets);
    }

    private buildTargetResolverCommon(
        multiSelectCardCondition?: (card: Card, selectedCards: Card[], context?: AbilityContext) => boolean,
        onSelectionSetChanged?: (selectedCards: Card[], context: AbilityContext) => void,
        activePromptTitle?: (context: AbilityContext, selectedCards: Card[]) => string,
        triggerResult?: ICostAdjustTriggerResult,
        canChooseNoTargets = false
    ): CardTargetResolver {
        const maxNumCardsFunc = this.maxTargetCount != null
            ? (context: AbilityContext) => this.getMaxTargetCount(context, triggerResult)
            : null;

        const resolverProperties: ICardTargetsResolver<AbilityContext> = {
            mode: TargetMode.BetweenVariable,
            minNumCardsFunc: (context) => context.costs[this.costPropertyName]?.minimumTargets ?? 1,
            maxNumCardsFunc,
            cardTypeFilter: this.targetCardTypeFilter,
            zoneFilter: this.targetZoneFilter,
            immediateEffect: this.effectSystem,
            controller: RelativePlayer.Self,
            appendToDefaultTitle: this.promptSuffix,
            cardCondition: this.targetCondition,
            onSelectionSetChanged,
            multiSelectCardCondition,
            activePromptTitle,
            mustChangeGameState: this.targetMustChangeGameState,
            optional: canChooseNoTargets
        };

        return new CardTargetResolver(this.costPropertyName, resolverProperties);
    }

    /** Updates the value on the context object indicating the current minimum number of targetable cards, based on the currently selected units */
    private updateMinimumTargetsInContext(
        selected: Card | Card[],
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        context: AbilityContext
    ) {
        const minimumTargetsResult = this.findMinimumTargetSetToPay(
            this.getSortedTargetsFromContext(context).map((t) => t.card),
            context,
            costAdjustTriggerResult,
            this.getPayingPlayer(context).readyResourceCount,
            Helpers.asArray(selected)
        );

        Contract.assertNotNullLike(minimumTargetsResult, 'No valid target set found to pay cost with targeted cost adjuster at pay time');

        context.costs[this.costPropertyName].minimumTargets = minimumTargetsResult.targetSet.length;
        context.costs[this.costPropertyName].otherDiscountsAmount = minimumTargetsResult.otherDiscountsAmount;
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
        const maxTargetCount = this.getMaxTargetCount(context, adjustResult);
        if (maxTargetCount != null && selectedCards.length === maxTargetCount) {
            return false;
        }

        const availableResources = this.getPayingPlayer(context).readyResourceCount;
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
    protected getNumberOfLegalTargets(targetResolver: CardTargetResolver, context: AbilityContext, adjustResult?: ICostAdjustResult) {
        const availableTargetsCount = targetResolver.getAllLegalTargets(context).length;
        const maxTargetCount = this.getMaxTargetCount(context, adjustResult);

        return maxTargetCount == null
            ? availableTargetsCount
            : Math.min(maxTargetCount, availableTargetsCount);
    }

    /**
     * The player paying the cost. This may not be the controller of the adjuster's source card,
     * e.g. if a player is playing a card owned by their opponent.
     */
    protected getPayingPlayer(context: AbilityContext): Player {
        return context.player;
    }

    /**
     * Returns the maximum number of targets that can be selected, or null if unlimited.
     * If `adjustResult` is provided, subclasses may use the current state of the adjustment to further limit the count.
     */
    protected getMaxTargetCount(context: AbilityContext, _adjustResult?: ICostAdjustResult): number | null {
        if (this.maxTargetCount == null) {
            return null;
        }

        return typeof this.maxTargetCount === 'function' ? this.maxTargetCount(context) : this.maxTargetCount;
    }

    /**
     * Whether the player is first prompted to choose whether to use the adjuster (e.g. "Trigger Exploit" / "Play without Exploit").
     * If false, the player goes directly to target selection instead, with the option to choose nothing if no targets are required.
     */
    protected usesPayModePrompt(): boolean {
        return true;
    }

    /**
     * Called after the player has selected targets for the adjustment, before the effect events are generated.
     * Allows subclasses to prepare game state for the effect (e.g. rearranging resources).
     */
    protected onTargetsSelected(_selectedTargets: Card[], _triggerResult: ICostAdjustTriggerResult, _context: AbilityContext): void {
        return;
    }

    /**
     * Returns the number of ready resources that would be consumed by applying this adjuster's effect to the given number of targets
     * (i.e., if the targets are themselves ready resources). These resources cannot also be exhausted to pay the remaining cost.
     */
    protected getResourcesConsumedByTargets(_targetCount: number, _context: AbilityContext): number {
        return 0;
    }

    /**
     * Computes the minimum remaining cost after all downstream adjusters, for use when the result of this adjuster does not
     * change what downstream adjusters can do. This lets target set evaluation apply this stage's discount with simple subtraction.
     */
    private getStaticRemainingCostAfterOtherDiscounts(context: AbilityContext, costAdjustTriggerResult: ICostAdjustTriggerResult): number {
        const simulatedCost = this.simulateRemainingAdjustments(context, costAdjustTriggerResult);

        Contract.assertTrue(
            simulatedCost.reservedResources === 0,
            `Downstream cost adjusters reserve resources, so ${this.costAdjustType} adjuster cannot use static cost evaluation. doesAdjustmentUseOpportunityCost() must return true for this case.`
        );

        return simulatedCost.value;
    }

    protected buildActivePromptTitleHandler(
        _triggerResult: ICostAdjustTriggerResult
    ): ((context: AbilityContext, selectedCards: Card[]) => string) | null {
        return null;
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
