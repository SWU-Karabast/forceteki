import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { Aspect } from '../Constants';
import type { AdjustedCostEvaluator, DynamicOpportunityCost, SimpleAdjustedCost } from './AdjustedCostEvaluator';
import type { CostAdjuster, CostAdjustResolutionMode } from './CostAdjuster';

export enum CostAdjustStage {
    Standard_0 = 'standard_0',
    Exploit_1 = 'exploit_1',
    ExhaustUnits_2 = 'exhaustUnits_2',
    PayStage_3 = 'payStage_3',
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

export interface ICostAdjusterEvaluationTargetSet {
    targets: ICostAdjusterEvaluationTarget[];

    // TODO THIS PR: remove
    targetsAreOrdered: boolean;
}

export interface ICostAdjusterEvaluationTarget {
    unit: IUnitCard;
    opportunityCost?: Map<CostAdjustStage, IEvaluationOpportunityCost>;
}

export interface IAbilityCostAdjustmentProperties {
    totalResourceCost: number;
    matchingAdjusters: Map<CostAdjustStage, CostAdjuster[]>;
    penaltyAspects?: Aspect[];
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

// TODO THIS PR: remove if no longer needed

export interface ICostAdjustEvaluationResult extends ICostAdjustmentResolutionProperties {
    resolutionMode: CostAdjustResolutionMode.Evaluate;
    adjustedCost: AdjustedCostEvaluator;
    costAdjusterTargets: ICostAdjusterEvaluationTargetSet;
}

export type ICostAdjustResult = ICostAdjustTriggerResult | ICostAdjustEvaluationResult;
