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
import type { CostAdjustStage, ICostAdjustEvaluationIntermediateResult, ICostAdjustEvaluationResult, ICostAdjustResult, ICostAdjustTriggerResult, IEvaluationOpportunityCost } from './CostInterfaces';
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
    sortedAvailableTargets: IOpportunityCostTarget[];
    minimumTargets?: number;
    selectedTargets?: IUnitCard[];
}

interface IOpportunityCostTarget {
    unit: IUnitCard;
    opportunityCost: IEvaluationOpportunityCost;
}

export abstract class TargetedCostAdjuster extends CostAdjuster {
    protected readonly adjustAmountPerTarget: number;
    protected readonly costPropertyName: string;
    protected readonly doNotUseAdjusterButtonText: string;
    protected readonly effectSystem: GameSystem<AbilityContext<IUnitCard>>;
    protected readonly eventName: EventName;
    protected readonly maxTargetCount?: number;
    protected readonly promptSuffix: string;
    protected readonly useAdjusterButtonText: string;

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
    }

    protected abstract buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>>;

    public override isTargeted(): this is TargetedCostAdjuster {
        return true;
    }

    protected override canAdjust(card: Card, context: AbilityContext<ICardWithCostProperty>, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        const targetResolver = this.buildEvaluationStageTargetResolver();

        // check available legal targets
        if (!targetResolver.hasLegalTarget(context)) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    public override getAmount(card: Card, player: Player, context: AbilityContext, currentAmount: number = null): number {
        const targetResolver = this.buildEvaluationStageTargetResolver();
        return this.getNumberOfLegalTargets(targetResolver, context) * this.adjustAmountPerTarget;
    }

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

        const sortedTargetsWithOpportunityCost =
            this.buildSortedTargets(abilityCostResult.costAdjustments, context);

        const costProps: IContextCostProps = {
            sortedAvailableTargets: sortedTargetsWithOpportunityCost
        };
        context.costs[this.costPropertyName] = costProps;

        this.checkAddAdjusterToTriggerList(context.source, costAdjustTriggerResult);

        // TODO THIS PR: put the sorted targets list on the context
        const targetResolver = this.buildTriggerStageTargetResolver(abilityCostResult.costAdjustments, costAdjustTriggerResult, context);

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

    protected override applyMaxAdjustmentAmount(_card: Card, context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]) {
        const targetResolver = this.buildEvaluationStageTargetResolver();

        const numRemovedTargets = previousTargetSelections ? this.getNumberOfRemovedTargets(previousTargetSelections, context) : 0;

        const adjustAmount = (this.getNumberOfLegalTargets(targetResolver, context) - numRemovedTargets) * this.adjustAmountPerTarget;
        result.adjustedCost.applyStaticDecrease(adjustAmount);
    }

    protected getNumberOfRemovedTargets(previousTargetSelections: ITriggerStageTargetSelection[], context: AbilityContext): number {
        return 0;
    }

    protected override resolveCostAdjustmentInternal(_card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        const targetResolver = this.buildEvaluationStageTargetResolver();

        const targets = this.buildSortedTargets(evaluationResult, context);
        const numTargets = Math.min(targets.length, this.getNumberOfLegalTargets(targetResolver, context));

        for (let i = 0; i < numTargets; i++) {
            const opportunityCost = targets[i].opportunityCost;
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

    private evaluateTargetable(
        card: Card,
        selectedCards: Card[],
        context: AbilityContext,
        selectableCardsSorted: Card[],
        costResult: ICostAdjustTriggerResult
    ): boolean {
        const availableResources = context.player.readyResourceCount;
        const currentAdjustedCost = costResult.adjustedCost.value;

        const currentDiscountAmount = selectedCards.length * this.adjustAmountPerTarget;
        const remainingCostToPay = Math.max(0, currentAdjustedCost - currentDiscountAmount);

        if (remainingCostToPay <= availableResources) {
            return true;
        }

        const minimumTargetSetToPay = this.findMinimumTargetSetToPay(
            selectableCardsSorted,
            context,
            costResult,
            availableResources,
            [...selectedCards, card]
        );

        return minimumTargetSetToPay != null;
    }

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

        do {
            const adjustResultCopy = { ...adjustResult, adjustedCost: adjustResult.adjustedCost.copy() };
            const adjustAmountForTargetSet = potentialTargetSet.length * this.adjustAmountPerTarget;
            adjustResultCopy.adjustedCost.applyStaticDecrease(adjustAmountForTargetSet);

            const minimumPossibleRemainingCost =
                this.getMinimumPossibleRemainingCost(context, adjustResultCopy, potentialTargetSet);

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

    // TODO THIS PR: can we just cache this?
    private buildEvaluationStageTargetResolver(): CardTargetResolver {
        return this.buildTargetResolverCommon();
    }

    private buildTriggerStageTargetResolver(
        evaluationResult: ICostAdjustEvaluationResult,
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
