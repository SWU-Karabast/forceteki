import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { AdjustedCostEvaluator } from './evaluation/AdjustedCostEvaluator';
import type { CostAdjuster, CostAdjustResolutionMode } from './CostAdjuster';
import type { DynamicOpportunityCost } from './evaluation/DynamicOpportunityCost';
import type { SimpleAdjustedCost } from './evaluation/SimpleAdjustedCost';
import type { Aspect } from '../Constants';

export enum CostAdjustStage {
    Standard_0 = 'standard_0',
    IgnoreWildcard_1 = 'ignoreWildcard_1',
    Exploit_2 = 'exploit_2',
    DamageUnits_3 = 'damageUnits_3',
    DefeatResources_4 = 'defeatResources_4',
    PayStage_5 = 'payStage_5',
    ExhaustUnits_6 = 'exhaustUnits_6',
    DefeatCredits_7 = 'defeatCredits_7',
    Increase_8 = 'increase_8'
}

export enum ResourceCostType {
    Ability = 'ability',
    PlayCard = 'playCard',
    CardEffectPayment = 'cardEffectPayment'
}

export interface IEvaluationOpportunityCost {
    max: number;
    dynamic?: DynamicOpportunityCost;
}

export interface ICostAdjusterEvaluationTarget {
    unit: IUnitCard;
    opportunityCost?: Map<CostAdjustStage, IEvaluationOpportunityCost>;
}

export interface IPenaltyAspectFilters {
    aspect?: Aspect;
    isIgnored?: boolean;
}

export interface IAbilityCostAdjustmentProperties {
    getTotalResourceCost: (includeAspectPenalties?: boolean) => number;
    getPenaltyAspects: (filter?: IPenaltyAspectFilters) => Aspect[];
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
