import * as Contract from '../utils/Contract';
import { CostAdjustStage } from './CostInterfaces';

export function getCostAdjustStagesInEvaluationOrder(): CostAdjustStage[] {
    return [
        CostAdjustStage.Increase_4,
        CostAdjustStage.PayStage_3,
        CostAdjustStage.ExhaustUnits_2,
        CostAdjustStage.Exploit_1,
        CostAdjustStage.Standard_0
    ];
}

export function getCostAdjustStagesInTriggerOrder(): CostAdjustStage[] {
    return [
        CostAdjustStage.Standard_0,
        CostAdjustStage.Exploit_1,
        CostAdjustStage.ExhaustUnits_2,
        CostAdjustStage.PayStage_3,
        // we do not run the increase step during triggering / payment, it was added on during the evaluation pass
    ];
}

export function isTargetedCostAdjusterStage(stage: CostAdjustStage): boolean {
    switch (stage) {
        case CostAdjustStage.Exploit_1:
        case CostAdjustStage.ExhaustUnits_2:
            return true;
        case CostAdjustStage.Standard_0:
        case CostAdjustStage.PayStage_3:
        case CostAdjustStage.Increase_4:
            return false;
        default:
            Contract.fail(`Unknown CostAdjustStage value: ${stage}`);
    }
}