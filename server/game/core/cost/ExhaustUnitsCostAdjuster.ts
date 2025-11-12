import { ExhaustSystem } from '../../gameSystems/ExhaustSystem';
import type { AbilityContext } from '../ability/AbilityContext';
import { CardTargetResolver } from '../ability/abilityTargets/CardTargetResolver';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { EventName, RelativePlayer, TargetMode, WildcardCardType } from '../Constants';
import type Game from '../Game';
import type { IExhaustUnitsCostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import * as Contract from '../utils/Contract.js';
import * as Helpers from '../utils/Helpers.js';
import type { ICostResult } from './ICost';
import { GameEvent } from '../event/GameEvent';
import { CostAdjustStage, type ICostAdjustEvaluationResult, type ICostAdjustTriggerResult } from './CostInterfaces';

export class ExhaustUnitsCostAdjuster extends CostAdjuster {
    private numExhaustedUnits?: number = null;
    private finalCost?: number = null;

    private readonly targetResolver: CardTargetResolver;
    private readonly exhaustSystem: ExhaustSystem;
    private readonly canExhaustUnitCondition: (card: IUnitCard, context: AbilityContext) => boolean;

    private minimumExhaustCount?: number = null;

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IExhaustUnitsCostAdjusterProperties
    ) {
        super(game, source,
            {
                ...properties,
                costAdjustType: CostAdjustType.ExhaustUnits
            }
        );

        this.exhaustSystem = new ExhaustSystem({ isCost: true });
        this.canExhaustUnitCondition = properties.canExhaustUnitCondition;
        this.targetResolver = new CardTargetResolver(
            'exhaustUnitsCostAdjuster', {
                mode: TargetMode.BetweenVariable,
                minNumCardsFunc: () => this.minimumExhaustCount ?? 1,
                maxNumCardsFunc: (context) => this.getMaxExhaustableCount(context),
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && this.canExhaustUnitCondition(card, context),
                immediateEffect: this.exhaustSystem,
                controller: RelativePlayer.Self,
                appendToDefaultTitle: 'to exhaust as if they were resources',
            }
        );
    }

    public override canAdjust(card: Card, context: AbilityContext<ICardWithCostProperty>, evaluationResult: ICostAdjustEvaluationResult) {
        // if we haven't yet resolved the exhaust targets, just check if there are any legal targets
        if (this.numExhaustedUnits == null && !this.targetResolver.hasLegalTarget(context)) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    public override queueGenerateEventGameSteps(
        events: any[],
        context: AbilityContext<ICardWithCostProperty>,
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        abilityCostResult?: ICostResult
    ) {
        Contract.assertIsNullLike(this.minimumExhaustCount);
        Contract.assertIsNullLike(this.numExhaustedUnits);

        // TODO: move this up to triggered adjuster base class so it always happens
        this.checkAddAdjusterToTriggerList(context.source, costAdjustTriggerResult);

        // calculate available downstream adjustments so we can determine how much many units we're required to exhaust
        const preAdjustedCost = this.getMinimumPossibleRemainingCost(context, costAdjustTriggerResult);
        this.finalCost = preAdjustedCost;

        const maxExhaustableCount = this.getMaxExhaustableCount(context);

        // if no exhaustable units, shortcut past exhaust prompt
        if (maxExhaustableCount === 0) {
            this.numExhaustedUnits = 0;
            return;
        }

        const minimumExhaustRequiredToPay = Math.max(0, preAdjustedCost - context.player.readyResourceCount);
        this.minimumExhaustCount = Math.max(1, minimumExhaustRequiredToPay);
        const canPlayWithoutExhausting = preAdjustedCost <= context.player.readyResourceCount;

        // If exhausting units is the only way the player can pay the cost, skip straight to unit selection
        if (!abilityCostResult.canCancel && !canPlayWithoutExhausting) {
            this.resolveExhaust(events, context, costAdjustTriggerResult, abilityCostResult);
            return;
        }

        // TODO: make this configurable so it can say "exhausting droids"
        const choices = ['Pay cost by exhausting units'];
        const handlers = [
            () => this.resolveExhaust(events, context, costAdjustTriggerResult, abilityCostResult)
        ];

        if (abilityCostResult.canCancel) {
            choices.push('Cancel');
            handlers.push(() => {
                abilityCostResult.cancelled = true;
                this.resetForCancel();
            });
        }

        // add normal play option if available
        if (canPlayWithoutExhausting) {
            choices.unshift('Pay cost normally');
            handlers.unshift(() => {
                this.numExhaustedUnits = 0;
            });
        }

        context.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: `Choose pay mode for ${context.source.title}`,
            choices,
            handlers
        });
    }

    protected override applyMaxAdjustmentAmount(_card: Card, context: AbilityContext, result: ICostAdjustTriggerResult) {
        const adjustAmount = (this.numExhaustedUnits != null ? this.numExhaustedUnits : this.getMaxExhaustableCount(context));
        result.remainingCost -= adjustAmount;
    }

    protected override getCostStage(costAdjustType: CostAdjustType): CostAdjustStage {
        Contract.assertTrue(costAdjustType === CostAdjustType.ExhaustUnits, `ExhaustUnitsCostAdjuster must have costAdjustType of '${CostAdjustType.ExhaustUnits}', instead got '${costAdjustType}'`);
        return CostAdjustStage.ExhaustUnits_2;
    }

    private resolveExhaust(
        events: any[],
        context: AbilityContext,
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        abilityCostResult: ICostResult
    ) {
        // step 1: ask player to choose defeat targets
        this.targetResolver.resolve(context, abilityCostResult);

        // step 2: generate the Exploit event (which in turn emits the defeat events)
        context.game.queueSimpleStep(() => {
            if (!abilityCostResult.cancelled) {
                this.numExhaustedUnits = Helpers.asArray(context.targets.exhaustUnitsCostAdjuster).length;
                events.push(this.buildExhaustEvent(context));
                costAdjustTriggerResult.remainingCost -= this.numExhaustedUnits;
            }
        }, `generate exhaustUnitsCostAdjuster event for ${context.source.internalName}`);
    }

    private buildExhaustEvent(context) {
        Contract.assertNotNullLike(context.targets.exhaustUnitsCostAdjuster);

        const payEvents = [];
        const targets = Helpers.asArray(context.targets.exhaustUnitsCostAdjuster);

        // create the events for exhausting the selected units
        for (const unit of targets) {
            payEvents.push(this.exhaustSystem.generateRetargetedEvent(unit, context));
        }

        const exhaustEvent = new GameEvent(
            EventName.OnExhaustUnitsToPayCost,
            context,
            { units: targets }
        );

        exhaustEvent.setContingentEventsGenerator((event) => {
            for (const payEvent of payEvents) {
                payEvent.order = event.order - 1;
            }
            return [...payEvents];
        });

        return exhaustEvent;
    }

    public resetForCancel() {
        // reset the cost adjuster so it can be used again after a cancel
        this.finalCost = null;
        this.numExhaustedUnits = null;
    }

    private getMaxExhaustableCount(context: AbilityContext): number {
        // Arbitrarily default to nonzero number to determine if there are targets to exhaust
        const cost = this.finalCost ?? 1;
        return Math.min(cost, this.targetResolver.getAllLegalTargets(context).length);
    }
}