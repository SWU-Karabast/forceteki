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
        context.game.queueSimpleStep(() => {
            if (!abilityCostResult.cancelled) {
                abilityCostResult.canCancel = false;
                costAdjustTriggerResult.adjustedCost.applyStaticDecrease(context.player.creditTokenCount);
                events.push(this.buildEvent(context));
            }
        }, `generate defeatCreditTokens event for ${context.source.internalName}`);
    }

    private buildEvent(context): GameEvent {
        const individualEvents = [];
        const player = context.player;
        const creditTokens = player.baseZone.credits;
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