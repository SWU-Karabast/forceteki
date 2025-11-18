import type { AbilityContext } from '../ability/AbilityContext';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import { EventName } from '../Constants';
import type Game from '../Game';
import type { IExhaustUnitsCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjustResolutionMode, CostAdjustType } from './CostAdjuster';
import * as Contract from '../utils/Contract.js';
import type { IAbilityCostAdjustmentProperties, ICostAdjustEvaluationIntermediateResult, ICostAdjustResult, IEvaluationOpportunityCost } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';
import { PerPlayerPerGameAbilityLimit } from '../ability/AbilityLimit';
import { TargetedCostAdjuster } from './TargetedCostAdjuster';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { ExhaustSystem } from '../../gameSystems/ExhaustSystem';
import type { Card } from '../card/Card';
import { DynamicOpportunityCost } from './evaluation/DynamicOpportunityCost';

/**
 * Subclass of {@link TargetedCostAdjuster} that implements the additional details specific to
 * cost adjustment effects that allow exhausting units instead of paying resources (Vuutun Palaa).
 *
 * The biggest difference is the addition of the "opportunity cost" for Exploiting away a unit
 * that would impact how many resources can be saved by using the adjuster effect.
 */
export class ExhaustUnitsCostAdjuster extends TargetedCostAdjuster {
    private canExhaustUnitCondition?: (card: IUnitCard, context: AbilityContext) => boolean;

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IExhaustUnitsCostAdjusterProperties
    ) {
        super(game, source, CostAdjustStage.ExhaustUnits_3,
            {
                limit: new PerPlayerPerGameAbilityLimit(game, 1),
                ...properties,
                costAdjustType: CostAdjustType.ExhaustUnits,
                adjustAmountPerTarget: 1,
                costPropertyName: 'exhaustUnits',
                useAdjusterButtonText: 'Pay cost by exhausting units',
                doNotUseAdjusterButtonText: 'Pay cost normally',
                eventName: EventName.OnExhaustUnitsToPayCost,
                promptSuffix: 'to exhaust as if they were resources',
                targetCondition: properties.canExhaustUnitCondition
            }
        );

        this.canExhaustUnitCondition = properties.canExhaustUnitCondition;
    }

    protected override buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>> {
        return new ExhaustSystem({ isCost: true });
    }

    /** As of right now, the Exhaust effect would not impact other adjusters and therefore has no opportunity cost considerations */
    protected override doesAdjustmentUseOpportunityCost(_adjustmentProps: IAbilityCostAdjustmentProperties) {
        return false;
    }

    protected override applyMaxAdjustmentAmount(_card: Card, _context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]) {
        Contract.assertTrue(result.resolutionMode === CostAdjustResolutionMode.Trigger, `Must only be called at Trigger stage, instead got ${result.resolutionMode}`);

        // if the source (Vuutun Palaa) was removed via Exploit, no adjustment available
        if (previousTargetSelections?.some((selection) => selection.card === this.source)) {
            return;
        }

        super.applyMaxAdjustmentAmount(_card, _context, result, previousTargetSelections);
    }

    /** Counts how many Droids which could have been paid with that were removed via Exploit choices */
    protected override getNumberOfRemovedTargets(previousTargetSelections: ITriggerStageTargetSelection[], context: AbilityContext): number {
        let numRemoved = 0;
        for (const selection of previousTargetSelections) {
            if (
                this.isTargetableForExhaust(selection.card, context) &&
                selection.stage === CostAdjustStage.Exploit_1
            ) {
                numRemoved++;
            }
        }
        return numRemoved;
    }

    /**
     * Does the standard cost adjustment resolution for a TargetedCostAdjuster, but also adds on the "opportunity cost" data for
     * the Exploit step to be able to correctly math out the net cost of removing any relevant units.
     */
    protected override resolveCostAdjustmentInternal(card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        super.resolveCostAdjustmentInternal(card, context, evaluationResult);

        // we cheat a bit here - we add a dynamic cost of "0" to Vuutun Palaa, since the opportunity cost on the individual droids will have been factored in already
        // the reason we do this is that we still want to track the max opportunity cost but not have it be double-counted with the droids
        const dynamicCost = new DynamicOpportunityCost((_remainingCost: number) => 0, evaluationResult);
        evaluationResult.adjustedCost.applyDynamicOffset(dynamicCost);

        const adjustSourceEntry = evaluationResult.costAdjusterTargets.find(
            (t) => t.unit === this.source
        );

        Contract.assertNotNullLike(adjustSourceEntry, `Source card ${this.source.internalName} of ExhaustUnitsCostAdjuster not found in costAdjusterTargets`);

        const maxTargetableUnits = context.player.getArenaUnits()
            .filter((unit) => this.isTargetableForExhaust(unit, context))
            .length;

        // the worst-case opportunity cost for removing Vuutun Palaa is that you no longer get to pay with any of the droids on the field
        const opportunityCost: IEvaluationOpportunityCost = {
            max: maxTargetableUnits,
            dynamic: dynamicCost
        };

        this.setOrAddOpportunityCost(
            adjustSourceEntry,
            opportunityCost,
            CostAdjustStage.Exploit_1,
        );

        for (const targetEntry of evaluationResult.costAdjusterTargets) {
            if (this.isTargetableForExhaust(targetEntry.unit, context)) {
                this.setOrAddOpportunityCost(
                    targetEntry,
                    { max: 1 },
                    CostAdjustStage.Exploit_1,
                );
            }
        }
    }

    private isTargetableForExhaust(unit: Card, context: AbilityContext): boolean {
        return this.effectSystem.canAffect(unit, context as AbilityContext<IUnitCard>, { isCost: true }) &&
          (!this.canExhaustUnitCondition || this.canExhaustUnitCondition(unit as IUnitCard, context));
    }
}
