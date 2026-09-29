import type { ILastKnownInformation } from '../event/LastKnownInformation';
import { Contract } from '../utils/Contract';
import { Helpers } from '../utils/Helpers';
import { CostAdjustStage } from './CostInterfaces';

export function getCostAdjustStagesInEvaluationOrder(): CostAdjustStage[] {
    return [
        CostAdjustStage.Increase_7,
        CostAdjustStage.DefeatCredits_6,
        CostAdjustStage.ExhaustUnits_5,
        CostAdjustStage.PayStage_4,
        CostAdjustStage.DefeatResources_3,
        CostAdjustStage.Exploit_2,
        CostAdjustStage.IgnoreWildcard_1,
        CostAdjustStage.Standard_0
    ];
}

export function getCostAdjustStagesInTriggerOrder(): CostAdjustStage[] {
    return [
        CostAdjustStage.Standard_0,
        CostAdjustStage.IgnoreWildcard_1,
        CostAdjustStage.Exploit_2,
        CostAdjustStage.DefeatResources_3,
        CostAdjustStage.PayStage_4,
        CostAdjustStage.ExhaustUnits_5,
        CostAdjustStage.DefeatCredits_6
        // we do not run the increase step during triggering / payment, it was added on during the evaluation pass
    ];
}

export function isInteractiveCostAdjusterStage(stage: CostAdjustStage): boolean {
    switch (stage) {
        case CostAdjustStage.Exploit_2:
        case CostAdjustStage.DefeatResources_3:
        case CostAdjustStage.ExhaustUnits_5:
        case CostAdjustStage.DefeatCredits_6:
            return true;
        case CostAdjustStage.Standard_0:
        case CostAdjustStage.IgnoreWildcard_1:
        case CostAdjustStage.PayStage_4:
        case CostAdjustStage.Increase_7:
            return false;
        default:
            Contract.fail(`Unknown CostAdjustStage value: ${stage}`);
    }
}

export function getExploitedUnits(playEvent: any): ILastKnownInformation[] {
    return Helpers.asArray(playEvent.costs?.['exploit']?.selectedTargets ?? []);
}
