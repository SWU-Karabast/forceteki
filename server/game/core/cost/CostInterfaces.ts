import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { AdjustedCostEvaluator } from './evaluation/AdjustedCostEvaluator';
import type { CostAdjuster, CostAdjustResolutionMode } from './CostAdjuster';
import type { DynamicOpportunityCost } from './evaluation/DynamicOpportunityCost';
import type { SimpleAdjustedCost } from './evaluation/SimpleAdjustedCost';
import type { Aspect } from '../Constants';

export enum CostAdjustStage {
    Standard_0 = 'standard_0',
    Exploit_1 = 'exploit_1',
    PayStage_2 = 'payStage_2',
    ExhaustUnits_3 = 'exhaustUnits_3',
    Increase_4 = 'increase_4'
}

export enum ResourceCostType {
    Ability = 'ability',
    PlayCard = 'playCard'
}

export interface IEvaluationOpportunityCost {
    max: number;
    dynamic?: DynamicOpportunityCost;
}

export interface ICostAdjusterEvaluationTarget {
    unit: IUnitCard;
    opportunityCost?: Map<CostAdjustStage, IEvaluationOpportunityCost>;
}

export interface IAbilityCostAdjustmentProperties {
    getTotalResourceCost: (includeAspectPenalties?: boolean) => number;
    getPenaltyAspects: () => Aspect[];
    matchingAdjusters: Map<CostAdjustStage, CostAdjuster[]>;
    resourceCostType: ResourceCostType;
}

export interface ICostAdjustmentResolutionProperties extends IAbilityCostAdjustmentProperties {
    adjustedCost: SimpleAdjustedCost;
    adjustStage: CostAdjustStage;
}

export interface ICostAdjustTriggerResult extends ICostAdjustmentResolutionProperties {
    resolutionMode: CostAdjustResolutionMode.Trigger;
    triggeredAdjusters: Set<CostAdjuster>;
}

export interface ICostAdjustEvaluationResult extends ICostAdjustmentResolutionProperties {
    costAdjusterTargets: ICostAdjusterEvaluationTarget[];
}

export interface ICostAdjustEvaluationIntermediateResult extends ICostAdjustmentResolutionProperties {
    resolutionMode: CostAdjustResolutionMode.Evaluate;
    adjustedCost: AdjustedCostEvaluator;
    costAdjusterTargets: ICostAdjusterEvaluationTarget[];
}

export type ICostAdjustResult = ICostAdjustTriggerResult | ICostAdjustEvaluationIntermediateResult;
