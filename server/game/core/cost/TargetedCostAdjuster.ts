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
import type { ITargetedCostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster } from './CostAdjuster';
import type { ICostAdjustEvaluationIntermediateResult, ICostAdjustEvaluationResult, ICostAdjustResult, ICostAdjustTriggerResult, IEvaluationOpportunityCost } from './CostInterfaces';
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
}

interface IOpportunityCostTarget {
    unit: IUnitCard;
    opportunityCost: IEvaluationOpportunityCost;
}

export abstract class TargetedCostAdjuster extends CostAdjuster {
    private readonly effectSystem: GameSystem<AbilityContext<IUnitCard>>;

    protected readonly adjustAmountPerTarget: number;
    protected readonly costPropertyName: string;
    protected readonly doNotUseAdjusterButtonText: string;
    protected readonly eventName: EventName;
    protected readonly maxTargetCount?: number;
    protected readonly promptSuffix: string;
    protected readonly useAdjusterButtonText: string;

    protected readonly targetCondition?: (card: Card, context: AbilityContext) => boolean;

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: ITargetedCostAdjusterInitializationProperties
    ) {
        super(game, source, properties);

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

        const costProps: IContextCostProps = {};
        context.costs[this.costPropertyName] = costProps;

        this.checkAddAdjusterToTriggerList(context.source, costAdjustTriggerResult);

        const targetResolver = this.buildTriggerStageTargetResolver(abilityCostResult.costAdjustments, costAdjustTriggerResult, context);

        // calculate available downstream adjustments so we can determine how many targets we are required to select
        const preAdjustedCost = this.getMinimumPossibleRemainingCost(context, costAdjustTriggerResult);

        const maxTargetableUnitsCount = this.getNumberOfLegalTargets(targetResolver, context);
        const minimumTargetsRequiredToPay = Math.max(0, Math.ceil((preAdjustedCost - context.player.readyResourceCount) / this.adjustAmountPerTarget));
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

    protected override applyMaxAdjustmentAmount(_card: Card, context: AbilityContext, result: ICostAdjustResult) {
        const targetResolver = this.buildEvaluationStageTargetResolver();
        const adjustAmount = this.getNumberOfLegalTargets(targetResolver, context) * this.adjustAmountPerTarget;
        result.adjustedCost.applyStaticDecrease(adjustAmount);
    }

    public override resolveCostAdjustmentInternal(_card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        const targetResolver = this.buildEvaluationStageTargetResolver();

        const targets = this.getSortedTargets(evaluationResult, context);
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

    protected getSortedTargets(result: ICostAdjustEvaluationResult, context: AbilityContext): IOpportunityCostTarget[] {
        const targets: IOpportunityCostTarget[] = [];

        for (const { unit, opportunityCost: opportunityCostMap } of result.costAdjusterTargets.targets) {
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
        costResult: ICostAdjustTriggerResult,
        maxTargetable?: number,
    ): boolean {
        const availableResources = context.player.readyResourceCount;
        const currentAdjustedCost = costResult.adjustedCost.value;
        if (this.canPayWithTargetSet(selectedCards.length, availableResources, currentAdjustedCost)) {
            return true;
        }

        const maxTargetableConcrete = maxTargetable ?? selectableCardsSorted.length;

        const potentialTargetSet = selectedCards.map((card) => ({ card, stage: this.costAdjustStage }));
        const availableCards = [card, ...selectableCardsSorted];
        while (potentialTargetSet.length < maxTargetableConcrete) {
            let nextCard: Card;
            do {
                nextCard = availableCards.shift();
                Contract.assertNotNullLike(nextCard, 'Ran out of available cards while evaluating targetable units for cost adjuster');
            } while (selectedCards.includes(nextCard));

            potentialTargetSet.push({ card: nextCard, stage: this.costAdjustStage });

            const minimumPossibleRemainingCost =
                this.getMinimumPossibleRemainingCost(context, costResult, potentialTargetSet);

            if (this.canPayWithTargetSet(potentialTargetSet.length, availableResources, minimumPossibleRemainingCost)) {
                return true;
            }
        }

        return false;
    }

    private canPayWithTargetSet(numTargets: number, availableResources: number, currentAdjustedCost: number): boolean {
        const currentDiscountAmount = numTargets * this.adjustAmountPerTarget;
        const remainingCostToPay = Math.max(0, currentAdjustedCost - currentDiscountAmount);

        return remainingCostToPay <= availableResources;
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

    private buildEvaluationStageTargetResolver(): CardTargetResolver {
        return this.buildTargetResolverCommon();
    }

    private buildTriggerStageTargetResolver(
        evaluationResult: ICostAdjustEvaluationResult,
        triggerResult: ICostAdjustTriggerResult,
        context: AbilityContext
    ): CardTargetResolver {
        const sortedTargets =
            this.getSortedTargets(evaluationResult, context)
                .map((t) => t.unit);

        const multiSelectCardCondition = (card: Card, selectedCards: Card[], context?: AbilityContext) =>
            this.evaluateTargetable(
                card,
                selectedCards,
                context,
                sortedTargets,
                triggerResult,
                this.maxTargetCount,
            );

        return this.buildTargetResolverCommon(multiSelectCardCondition);
    }

    private buildTargetResolverCommon(
        multiSelectCardCondition?: (card: Card, selectedCards: Card[], context?: AbilityContext) => boolean
    ): CardTargetResolver {
        const maxNumCardsFunc = this.maxTargetCount
            ? () => this.maxTargetCount
            : null;

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
                multiSelectCardCondition
            }
        );
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
}
