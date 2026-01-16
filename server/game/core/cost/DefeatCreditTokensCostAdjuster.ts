import { DefeatCardSystem } from '../../gameSystems/DefeatCardSystem';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
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
import type { IDropdownListPromptProperties } from '../gameSteps/prompts/DropdownListPrompt';

export class DefeatCreditTokensCostAdjuster extends CostAdjusterWithGameSteps {
    public constructor(
        game: Game,
        sourcePlayer: Player
    ) {
        super(game, sourcePlayer, CostAdjustStage.DefeatCredits_4, {
            costAdjustType: CostAdjustType.DefeatCreditTokens,
            matchAbilityCosts: true
        });
    }

    public override isCreditTokenAdjuster(): this is DefeatCreditTokensCostAdjuster {
        return true;
    }

    protected override canAdjust(
        card: Card,
        context: AbilityContext,
        evaluationResult: ICostAdjustmentResolutionProperties
    ): boolean {
        if (context.player.creditTokenCount === 0) {
            return false;
        }

        Contract.assertNonEmpty(context.player.baseZone.credits, 'Player has no Credit tokens in base zone but creditTokenCount is greater than zero');

        // TODO: If there is ever an effect that can selectively blank Credit tokens,
        // this class will need to account for which Credits can actually be used to
        // adjust costs. For now, it's all or nothing (Galen Erso's effect).
        if (this.sourcePlayer.baseZone.credits[0].isBlank()) {
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

        // Max credit value should be non-zero if we reached this point
        Contract.assertTrue(maximumCreditsThatCanBeUsed > 0);

        const canPlayWithoutAdjuster = minimumCreditsRequiredToPay === 0;

        const choices: string[] = [];
        const handlers: (() => void)[] = [];

        // If there's only one amount of credits that can be used, don't offer multiple choices
        if (maximumCreditsThatCanBeUsed === minimumCreditsRequiredToPay || maximumCreditsThatCanBeUsed === 1) {
            choices.push(`Use ${this.creditString(maximumCreditsThatCanBeUsed)}`);
            handlers.push(() => {
                this.triggerCostAdjustmentEvents(events, maximumCreditsThatCanBeUsed, context, costAdjustTriggerResult, abilityCostResult);
            });
        } else {
            choices.push('Select amount');
            handlers.push(() => {
                this.promptDropdownList(
                    Math.max(1, minimumCreditsRequiredToPay),
                    maximumCreditsThatCanBeUsed,
                    context,
                    (chosenAmount: number) => {
                        this.triggerCostAdjustmentEvents(events, chosenAmount, context, costAdjustTriggerResult, abilityCostResult);
                    }
                );
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
            activePromptTitle: `Use Credit tokens for ${context.source.title}`,
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
        Contract.assertTrue(creditTokenCount > 0, 'creditTokenCount must be greater than zero to trigger payment event');

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

    private promptDropdownList(
        min: number,
        max: number,
        context: AbilityContext<Card>,
        onSelect: (chosenAmount: number) => void
    ): void {
        const props: IDropdownListPromptProperties = {
            promptTitle: 'Select amount of Credit tokens',
            options: Array.from({ length: max - min + 1 }, (_, i) => (i + min).toString()),
            source: context.source,
            choiceHandler: (choice: string) => onSelect(parseInt(choice, 10))
        };

        context.game.promptWithDropdownListMenu(context.player, props);
    }

    private creditString(count: number): string {
        return `${count} ${count === 1 ? 'Credit' : 'Credits'}`;
    }
}