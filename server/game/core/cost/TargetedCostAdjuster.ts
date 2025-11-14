import type { AbilityContext } from '../ability/AbilityContext';
import { CardTargetResolver } from '../ability/abilityTargets/CardTargetResolver';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { EventName } from '../Constants';
import { RelativePlayer, TargetMode, WildcardCardType } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type Game from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import type { ITargetedCostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster } from './CostAdjuster';
import type { ICostAdjustEvaluationResult, ICostAdjustTriggerResult } from './CostInterfaces';
import type { ICostResult } from './ICost';

export type ITargetedCostAdjusterInitializationProperties = ITargetedCostAdjusterProperties & {
    targetCondition?: (card: IUnitCard, context: AbilityContext) => boolean;
    doNotUseAdjusterButtonText: string;
    costPropertyName: string;
    useAdjusterButtonText: string;
    adjustAmountPerTarget: number;
    eventName: EventName;
    promptSuffix: string;
};

interface IContextCostProps {
    minimumTargets?: number;
    selectedTargets?: IUnitCard[];
}

export abstract class TargetedCostAdjuster extends CostAdjuster {
    private readonly effectSystem: GameSystem<AbilityContext<IUnitCard>>;
    private readonly targetResolver: CardTargetResolver;

    protected readonly adjustAmountPerTarget: number;
    protected readonly costPropertyName: string;
    protected readonly doNotUseAdjusterButtonText: string;
    protected readonly eventName: EventName;
    protected readonly promptSuffix: string;
    protected readonly useAdjusterButtonText: string;

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

        this.effectSystem = this.buildEffectSystem();

        this.targetResolver = new CardTargetResolver(
            this.costPropertyName, {
                mode: TargetMode.BetweenVariable,
                minNumCardsFunc: (context) => context.costs[this.costPropertyName]?.minimumTargets ?? 1,
                maxNumCardsFunc: (context) => this.getMaxTargetableCount(context),
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: this.effectSystem,
                controller: RelativePlayer.Self,
                appendToDefaultTitle: this.promptSuffix,
                cardCondition: properties.targetCondition
            }
        );
    }

    protected abstract buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>>;

    public override isTargeted(): this is TargetedCostAdjuster {
        return true;
    }

    protected override canAdjust(card: Card, context: AbilityContext<ICardWithCostProperty>, evaluationResult: ICostAdjustEvaluationResult) {
        // check available legal targets
        if (!this.targetResolver.hasLegalTarget(context)) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    public override getAmount(card: Card, player: Player, context: AbilityContext, currentAmount: number = null): number {
        return this.getMaxTargetableCount(context) * this.adjustAmountPerTarget;
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

        // calculate available downstream adjustments so we can determine how many targets we are required to select
        const preAdjustedCost = this.getMinimumPossibleRemainingCost(context, costAdjustTriggerResult);

        const maxTargetableUnitsCount = this.getMaxTargetableCount(context);
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
            this.triggerAdjustment(events, context, costAdjustTriggerResult, abilityCostResult);
            return;
        }

        const choices = [this.useAdjusterButtonText];
        const handlers = [
            () => this.triggerAdjustment(events, context, costAdjustTriggerResult, abilityCostResult)
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

    protected override applyMaxAdjustmentAmount(_card: Card, context: AbilityContext, result: ICostAdjustTriggerResult) {
        const adjustAmount = this.getMaxTargetableCount(context) * this.adjustAmountPerTarget;
        result.remainingCost -= adjustAmount;
    }

    private triggerAdjustment(
        events: any[],
        context: AbilityContext,
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        abilityCostResult: ICostResult
    ) {
        // step 1: ask player to choose targets
        this.targetResolver.resolve(context, abilityCostResult);

        // step 2: generate the cost reduction event (which in turn emits the individual events for each targeted unit)
        context.game.queueSimpleStep(() => {
            if (!abilityCostResult.cancelled) {
                costAdjustTriggerResult.remainingCost -= this.getSelectedUnitsCount(context) * this.adjustAmountPerTarget;
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

    // by default, can choose as many targets as meet the condition
    protected getMaxTargetableCount(context: AbilityContext) {
        return this.targetResolver.getAllLegalTargets(context).length;
    }

    private getSelectedUnitsCount(context: AbilityContext): number {
        return Helpers.asArray(context.targets[this.costPropertyName])?.length || 0;
    }
}
