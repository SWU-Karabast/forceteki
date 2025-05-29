import type { Aspect } from '../Constants';
import type { CostAdjuster } from './CostAdjuster';

export interface IRunCostAdjustmentProperties {
    additionalCostAdjusters?: CostAdjuster[];
    ignoreExploit?: boolean;
}

export interface IGetMatchingCostAdjusterProperties extends IRunCostAdjustmentProperties {
    penaltyAspect?: Aspect;
}
