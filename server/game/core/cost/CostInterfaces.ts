import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { Aspect } from '../Constants';
import type { CostAdjuster } from './CostAdjuster';

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

export interface ICostAdjusterEvaluationTargetSet {
    targets: ICostAdjusterEvaluationTarget[];
    targetsAreOrdered: boolean;
}

export interface ICostAdjusterEvaluationTarget {
    unit: IUnitCard;
    opportunityCost?: Map<CostAdjustStage, number>;
}

export interface IAbilityCostAdjustmentProperties {
    totalResourceCost: number;
    matchingAdjusters: Map<CostAdjustStage, CostAdjuster[]>;
    penaltyAspects?: Aspect[];
    resourceCostType: ResourceCostType;
}

export interface ICostAdjustmentResolutionProperties extends IAbilityCostAdjustmentProperties {
    remainingCost: number;
    adjustStage: CostAdjustStage;
}

export interface ICostAdjustTriggerResult extends ICostAdjustmentResolutionProperties {
    triggeredAdjusters: Set<CostAdjuster>;
}

export interface ICostAdjustEvaluationResult extends ICostAdjustmentResolutionProperties {
    costAdjusterTargets?: ICostAdjusterEvaluationTargetSet;
}
