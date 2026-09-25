import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { EventName, GameStateChangeRequired, WildcardCardType, ZoneName } from '../Constants';
import type { Game } from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { IDefeatCardProperties } from '../../gameSystems/DefeatCardSystem';
import { DefeatCardSystem } from '../../gameSystems/DefeatCardSystem';
import { DefeatSourceType } from '../../IDamageOrDefeatSource';
import { ChatHelpers } from '../chat/ChatHelpers';
import { Contract } from '../utils/Contract';
import { TextHelper } from '../utils/TextHelper';
import type { IDefeatResourcesCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjustResolutionMode, CostAdjustType } from './CostAdjuster';
import type { ICostAdjustEvaluationIntermediateResult, ICostAdjustEvaluationResult, ICostAdjustResult, ICostAdjustTriggerResult } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';
import type { IOpportunityCostTarget } from './TargetedCostAdjuster';
import { TargetedCostAdjuster } from './TargetedCostAdjuster';

import { registerState } from '../GameObjectUtils';

/**
 * Subclass of {@link TargetedCostAdjuster} for effects that allow defeating resources to reduce a card's cost (e.g. Greater Sarlacc).
 *
 * The key difference from other targeted adjusters is that the targets are themselves resources, so defeating a ready resource
 * also leaves one fewer resource available to pay the remaining cost. This is tracked by reserving the consumed resources
 * on the adjusted cost, so that payability checks account for them.
 *
 * Since players may rearrange their resources at any time before one is chosen, the player may select any of their resources and
 * the chosen resources are then rearranged into the best state for the effect before being defeated: ready if the effect requires
 * ready resources, otherwise exhausted (so that as many ready resources as possible remain to pay with).
 */
@registerState()
export class DefeatResourcesCostAdjuster extends TargetedCostAdjuster {
    public static readonly contextPropertyName = 'defeatResources';

    private readonly readyResourcesOnly: boolean;

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IDefeatResourcesCostAdjusterProperties
    ) {
        const readyResourcesOnly = !!properties.readyResourcesOnly;

        // evaluation assumes that each additional resource defeated never increases the number of ready resources needed to pay,
        // which only holds (e.g. after Starhawk halves the cost) if each one reduces the cost by at least 2
        Contract.assertTrue(properties.amountPerResource >= 2, `Defeat resources cost adjustment must be at least 2 per resource, instead got ${properties.amountPerResource}`);

        super(game, source, CostAdjustStage.DefeatResources_3,
            {
                ...properties,
                costAdjustType: CostAdjustType.DefeatResources,
                adjustAmountPerTarget: properties.amountPerResource,
                costPropertyName: DefeatResourcesCostAdjuster.contextPropertyName,
                eventName: EventName.OnDefeatResourcesToPayCost,
                promptSuffix: 'to defeat',
                targetCardTypeFilter: WildcardCardType.Any,
                targetZoneFilter: ZoneName.Resource,

                // the resource zone is hidden from the opponent, so without this the player could always choose nothing
                // even when defeating resources is required to pay the cost
                targetMustChangeGameState: GameStateChangeRequired.MustFullyResolve,

                // the card being played can't pay for itself this way (e.g. if it is being played from the resource zone)
                targetCondition: (card, context) => card !== context.source,

                // if the resources must be ready, can't defeat more than the number of ready resources
                maxTargetCount: readyResourcesOnly
                    ? (context) => context.player.readyResourceCount
                    : (context) => context.player.resources.length
            }
        );

        this.readyResourcesOnly = readyResourcesOnly;
    }

    protected override buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>> {
        // the chosen resources are rearranged into the correct state before being defeated, so don't swap their state again
        const defeatProps: IDefeatCardProperties = { defeatSource: DefeatSourceType.Ability, preserveResourceReadyState: true };
        return new DefeatCardSystem(defeatProps);
    }

    /**
     * Always evaluate downstream adjusters in full. The discount is capped by the remaining cost and targets may
     * consume ready resources, so the result can't be computed by simple subtraction (e.g. with Starhawk's halving).
     */
    protected override doesAdjustmentUseOpportunityCost(): boolean {
        return true;
    }

    /** The player goes directly to choosing resources to defeat, and may choose nothing if it isn't required to pay */
    protected override usesPayModePrompt(): boolean {
        return false;
    }

    protected override canAdjust(card: Card, context: AbilityContext<ICardWithCostProperty>, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        if (this.readyResourcesOnly && this.getPayingPlayer(context).readyResourceCount === 0) {
            return false;
        }

        return super.canAdjust(card, context, evaluationResult);
    }

    /** All legal resources are interchangeable, so none of them have an opportunity cost */
    protected override buildSortedTargets(_result: ICostAdjustEvaluationResult, context: AbilityContext): IOpportunityCostTarget[] {
        return this.defaultTargetResolver.getAllLegalTargets(context)
            .map((card) => ({ card, opportunityCost: { max: 0 } }));
    }

    /** If the adjustment state is known, don't allow defeating more resources than would further reduce the cost */
    protected override getMaxTargetCount(context: AbilityContext, adjustResult?: ICostAdjustResult): number | null {
        const maxDefeatable = super.getMaxTargetCount(context, adjustResult);
        if (adjustResult == null) {
            return maxDefeatable;
        }

        const maxUseful = Math.ceil(adjustResult.adjustedCost.value / this.adjustAmountPerTarget);
        return Math.min(maxDefeatable, maxUseful);
    }

    /**
     * Each defeated resource consumes a ready resource if the effect requires ready resources.
     * Otherwise, exhausted resources are defeated first and only the remainder consume ready resources.
     */
    protected override getResourcesConsumedByTargets(targetCount: number, context: AbilityContext): number {
        if (this.readyResourcesOnly) {
            return targetCount;
        }

        return Math.max(0, targetCount - this.getPayingPlayer(context).exhaustedResourceCount);
    }

    /**
     * At evaluation time, assumes the maximum number of resources is defeated. Since each resource defeated reduces the cost by
     * at least as much as the ready resource it may consume, this is always the best option for payability until the cost reaches zero,
     * at which point the card can be played regardless of how many resources were defeated.
     */
    protected override resolveCostAdjustmentInternal(_card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        this.applyAdjustmentForTargetCount(this.getNumberOfLegalTargets(this.defaultTargetResolver, context), evaluationResult, context);
    }

    /** Used when simulating the adjustment from an upstream stage (e.g. Exploit), defeats as many resources as would be useful */
    protected override applyMaxAdjustmentAmount(_card: Card, context: AbilityContext, result: ICostAdjustResult, _previousTargetSelections?: ITriggerStageTargetSelection[]) {
        Contract.assertTrue(result.resolutionMode === CostAdjustResolutionMode.Trigger, `Must only be called at Trigger stage, instead got ${result.resolutionMode}`);

        this.applyAdjustmentForTargetCount(this.getNumberOfLegalTargets(this.defaultTargetResolver, context, result), result, context);
    }

    protected override onTargetsSelected(selectedTargets: Card[], triggerResult: ICostAdjustTriggerResult, context: AbilityContext) {
        const selectedResources = selectedTargets.map((card) => {
            Contract.assertTrue(card.isPlayable() && card.zoneName === ZoneName.Resource, `Expected ${card.internalName} to be a resource`);
            return card;
        });

        // players may rearrange their resources before choosing, so put the chosen resources in the best state for the effect
        const payingPlayer = this.getPayingPlayer(context);
        payingPlayer.resourceZone.rearrangeResourcesToExhaustState(selectedResources, !this.readyResourcesOnly);

        if (this.readyResourcesOnly) {
            Contract.assertTrue(selectedResources.every((card) => !card.exhausted), 'Expected all resources selected for defeat to be ready after rearranging');
        }

        const discount = Math.min(selectedResources.length * this.adjustAmountPerTarget, triggerResult.adjustedCost.value);
        context.game.addMessage(
            '{0} defeats {1} to pay {2} less for {3}',
            payingPlayer,
            this.readyResourcesOnly
                ? ChatHelpers.pluralize(selectedResources.length, 'a ready resource', 'ready resources')
                : ChatHelpers.pluralize(selectedResources.length, 'a resource', 'resources'),
            TextHelper.resource(discount),
            context.source
        );
    }

    protected override buildActivePromptTitleHandler(triggerResult: ICostAdjustTriggerResult): (context: AbilityContext, selectedCards: Card[]) => string {
        return (context: AbilityContext) => {
            const maxTargets = this.getNumberOfLegalTargets(this.defaultTargetResolver, context, triggerResult);
            return `Defeat up to ${maxTargets} ${this.readyResourcesOnly ? 'ready ' : ''}${maxTargets === 1 ? 'resource' : 'resources'}`;
        };
    }

    private applyAdjustmentForTargetCount(targetCount: number, result: ICostAdjustResult, context: AbilityContext) {
        result.adjustedCost.applyStaticDecrease(targetCount * this.adjustAmountPerTarget);
        result.adjustedCost.reserveResources(this.getResourcesConsumedByTargets(targetCount, context));
    }
}
