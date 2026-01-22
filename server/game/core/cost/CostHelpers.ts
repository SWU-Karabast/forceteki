import type { ILastKnownInformation } from '../../gameSystems/DefeatCardSystem';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import { CostAdjustStage } from './CostInterfaces';

export function getCostAdjustStagesInEvaluationOrder(): CostAdjustStage[] {
    return [
        CostAdjustStage.Increase_6,
        CostAdjustStage.DefeatCredits_5,
        CostAdjustStage.ExhaustUnits_4,
        CostAdjustStage.PayStage_3,
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
        CostAdjustStage.PayStage_3,
        CostAdjustStage.ExhaustUnits_4,
        CostAdjustStage.DefeatCredits_5
        // we do not run the increase step during triggering / payment, it was added on during the evaluation pass
    ];
}

export function isInteractiveCostAdjusterStage(stage: CostAdjustStage): boolean {
    switch (stage) {
        case CostAdjustStage.Exploit_2:
        case CostAdjustStage.ExhaustUnits_4:
        case CostAdjustStage.DefeatCredits_5:
            return true;
        case CostAdjustStage.Standard_0:
        case CostAdjustStage.IgnoreWildcard_1:
        case CostAdjustStage.PayStage_3:
        case CostAdjustStage.Increase_6:
            return false;
        default:
            Contract.fail(`Unknown CostAdjustStage value: ${stage}`);
    }
}

export function getExploitedUnits(playEvent: any): ILastKnownInformation[] {
    return Helpers.asArray(playEvent.costs?.['exploit']?.selectedTargets ?? []);
}
