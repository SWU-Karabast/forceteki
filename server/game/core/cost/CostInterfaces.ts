import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { Aspect } from '../Constants';
import type { CostAdjuster } from './CostAdjuster';

export interface IRunCostAdjustmentProperties {
    additionalCostAdjusters?: CostAdjuster[];
    ignoreExploit?: boolean;
}

export interface IGetMatchingCostAdjusterProperties extends IRunCostAdjustmentProperties {
    penaltyAspect?: Aspect;
}

export enum CostAdjustStage {
    Standard_0 = 'standard_0',
    Exploit_1 = 'exploit_1',
    ExhaustUnits_2 = 'exhaustUnits_2',
    PayStage_3 = 'payStage_3',
    Increase_4 = 'increase_4',
}

export interface ICostAdjusterTargetSet {
    targets: ICostAdjusterTarget[];
    targetsAreOrdered: boolean;
}

export interface ICostAdjusterTarget {
    unit: IUnitCard;
    opportunityCost?: Map<CostAdjustStage, number>;
}

export interface ICostAdjustEvaluationResult {
    canPay: boolean;
}

export interface ICostAdjustIntermediateResult {
    remainingCost: number;
    adjustStage: CostAdjustStage;
    usedAdjusters: CostAdjuster[];
    remainingCostAtStage: Map<CostAdjustStage, number>;
    costAdjusterTargets?: ICostAdjusterTargetSet;
}
