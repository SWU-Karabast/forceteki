import { DefeatCardSystem } from '../../gameSystems/DefeatCardSystem';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import { EventName } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type Game from '../Game';
import type { Player } from '../Player';
import { CostAdjustType, type ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjusterWithGameSteps } from './CostAdjusterWithGameSteps';
import type { ICostAdjustmentResolutionProperties, ICostAdjustResult, ICostAdjustTriggerResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';
import type { ICostResult } from './ICost';
import * as Contract from '../utils/Contract';

export class DefeatCreditTokensCostAdjuster extends CostAdjusterWithGameSteps {
    public constructor(
        game: Game,
        source: ICardWithCostProperty
    ) {
        super(game, source, CostAdjustStage.DefeatCredits_4, {
            costAdjustType: CostAdjustType.DefeatCreditTokens,
            matchAbilityCosts: true
        });
    }

    protected override canAdjust(
        card: Card,
        context: AbilityContext,
        evaluationResult: ICostAdjustmentResolutionProperties
    ): boolean {
        if (context.player.creditTokenCount === 0) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    protected override getAmount(card: Card, player: Player, context: AbilityContext): number {
        return player.creditTokenCount;
    }

    protected override applyMaxAdjustmentAmount(card: Card, context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]): void {
        const credits = context.player.creditTokenCount;
        result.adjustedCost.applyStaticDecrease(credits);
    }

    public override queueGenerateEventGameSteps(
        events: any[],
        context: AbilityContext<Card>,
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        abilityCostResult?: ICostResult
    ) {
        const credits = context.player.creditTokenCount;
        const availableResources = context.player.readyResourceCount;
        const minimumCreditsRequiredToPay = Math.max(0, costAdjustTriggerResult.adjustedCost.value - availableResources);
        const maximumCreditsThatCanBeUsed = Math.min(credits, costAdjustTriggerResult.adjustedCost.value);

        // Payment shouldn't have been triggered if there aren't enough credits available to pay the minimum
        Contract.assertTrue(credits >= minimumCreditsRequiredToPay);

        const canPlayWithoutAdjuster = minimumCreditsRequiredToPay === 0;

        const choices: string[] = [];
        const handlers: (() => void)[] = [];

        // First, offer the choice to use the maximum number of credit tokens possible
        if (maximumCreditsThatCanBeUsed > 0) {
            choices.push(`Use ${maximumCreditsThatCanBeUsed} Credits (maximum)`);
            handlers.push(() => {
                this.triggerCostAdjustmentEvents(events, maximumCreditsThatCanBeUsed, context, costAdjustTriggerResult, abilityCostResult);
            });
        }

        // If the maximum is not the same as the minimum, offer the choice to use the minimum number of credit tokens possible
        if (maximumCreditsThatCanBeUsed !== minimumCreditsRequiredToPay) {
            choices.push(`Use ${minimumCreditsRequiredToPay} Credits (minimum)`);
            handlers.push(() => {
                this.triggerCostAdjustmentEvents(events, minimumCreditsRequiredToPay, context, costAdjustTriggerResult, abilityCostResult);
            });
        }

        // Offer the choice to skip using credit tokens if possible
        if (canPlayWithoutAdjuster) {
            choices.push('Pay costs without Credit tokens');
            handlers.push(() => undefined);
        }

        // Offer the choice to not play the card / use the ability
        if (abilityCostResult.canCancel) {
            choices.push('Cancel');
            handlers.push(() => {
                abilityCostResult.cancelled = true;
            });
        }

        context.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: `Choose pay mode for ${context.source.title}`,
            choices,
            handlers
        });
    }

    private triggerCostAdjustmentEvents(
        events: any[],
        creditTokenCount: number,
        context: AbilityContext<Card>,
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        abilityCostResult?: ICostResult
    ): void {
        context.game.queueSimpleStep(() => {
            if (!abilityCostResult.cancelled) {
                abilityCostResult.canCancel = false;
                costAdjustTriggerResult.adjustedCost.applyStaticDecrease(creditTokenCount);
                events.push(this.buildEvent(context, creditTokenCount));
            }
        }, `generate defeatCreditTokens event for ${context.source.internalName}`);
    }

    private buildEvent(context, creditTokenCount: number): GameEvent {
        const individualEvents = [];
        const player = context.player;
        const creditTokens = player.baseZone.credits.slice(0, creditTokenCount);
        const defeatSystem = new DefeatCardSystem({ defeatSource: DefeatSourceType.Ability });

        for (const token of creditTokens) {
            individualEvents.push(defeatSystem.generateRetargetedEvent(token, context));
        }

        const overallPaymentEvent = new GameEvent(EventName.OnDefeatCreditsToPayCost, context, {});

        overallPaymentEvent.setContingentEventsGenerator((event) => {
            for (const defeatEvent of individualEvents) {
                defeatEvent.order = event.order - 1;
            }
            return [...individualEvents];
        });

        return overallPaymentEvent;
    }
}