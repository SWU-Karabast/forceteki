import type { AbilityContext } from '../ability/AbilityContext';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import { EventName, Trait } from '../Constants';
import type Game from '../Game';
import type { IExhaustUnitsCostAdjusterProperties, ITriggerStageTargetSelection } from './CostAdjuster';
import { CostAdjustResolutionMode, CostAdjustType } from './CostAdjuster';
import * as Contract from '../utils/Contract.js';
import type { ICostAdjustEvaluationIntermediateResult, ICostAdjustResult, IEvaluationOpportunityCost } from './CostInterfaces';
import { CostAdjustStage } from './CostInterfaces';
import { PerPlayerPerGameAbilityLimit } from '../ability/AbilityLimit';
import { TargetedCostAdjuster } from './TargetedCostAdjuster';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { ExhaustSystem } from '../../gameSystems/ExhaustSystem';
import type { Card } from '../card/Card';
import { DynamicOpportunityCost } from './AdjustedCostEvaluator';

export class ExhaustUnitsCostAdjuster extends TargetedCostAdjuster {
    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IExhaustUnitsCostAdjusterProperties
    ) {
        super(game, source,
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
    }

    protected override buildEffectSystem(): GameSystem<AbilityContext<IUnitCard>> {
        return new ExhaustSystem({ isCost: true });
    }

    protected override getCostStage(costAdjustType: CostAdjustType): CostAdjustStage {
        Contract.assertTrue(costAdjustType === CostAdjustType.ExhaustUnits, `ExhaustUnitsCostAdjuster must have costAdjustType of '${CostAdjustType.ExhaustUnits}', instead got '${costAdjustType}'`);
        return CostAdjustStage.ExhaustUnits_3;
    }

    protected override applyMaxAdjustmentAmount(_card: Card, _context: AbilityContext, result: ICostAdjustResult, previousTargetSelections?: ITriggerStageTargetSelection[]) {
        Contract.assertTrue(result.resolutionMode === CostAdjustResolutionMode.Trigger, `Must only be called at Trigger stage, instead got ${result.resolutionMode}`);

        if (previousTargetSelections?.some((selection) => selection.card === this.source)) {
            return;
        }

        super.applyMaxAdjustmentAmount(_card, _context, result, previousTargetSelections);
    }

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

    protected override resolveCostAdjustmentInternal(card: Card, context: AbilityContext, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        super.resolveCostAdjustmentInternal(card, context, evaluationResult);

        const dynamicCost = new DynamicOpportunityCost((_remainingCost: number) => 0, evaluationResult);
        evaluationResult.adjustedCost.applyDynamicOffset(dynamicCost);

        const adjustSourceEntry = evaluationResult.costAdjusterTargets.targets.find(
            (t) => t.unit === this.source
        );

        Contract.assertNotNullLike(adjustSourceEntry, `Source card ${this.source.internalName} of ExhaustUnitsCostAdjuster not found in costAdjusterTargets`);

        const maxTargetableUnits = context.player.getArenaUnits()
            .filter((unit) => this.isTargetableForExhaust(unit, context))
            .length;

        const opportunityCost: IEvaluationOpportunityCost = {
            max: maxTargetableUnits,
            dynamic: dynamicCost
        };

        this.setOrAddOpportunityCost(
            adjustSourceEntry,
            opportunityCost,
            CostAdjustStage.Exploit_1,
        );

        for (const targetEntry of evaluationResult.costAdjusterTargets.targets) {
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
        return unit.hasSomeTrait(Trait.Droid) &&
          this.effectSystem.canAffect(unit, context as AbilityContext<IUnitCard>, { isCost: true });
    }
}
