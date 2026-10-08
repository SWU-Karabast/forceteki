import type { ILastKnownInformation } from '../event/LastKnownInformation';
import { Contract } from '../utils/Contract';
import { Helpers } from '../utils/Helpers';
import { CostAdjustStage } from './CostInterfaces';

export function getCostAdjustStagesInEvaluationOrder(): CostAdjustStage[] {
    return [
        CostAdjustStage.Increase_8,
        CostAdjustStage.DefeatCredits_7,
        CostAdjustStage.ExhaustUnits_6,
        CostAdjustStage.PayStage_5,
        CostAdjustStage.DefeatResources_4,
        CostAdjustStage.DamageUnits_3,
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
        CostAdjustStage.DamageUnits_3,
        CostAdjustStage.DefeatResources_4,
        CostAdjustStage.PayStage_5,
        CostAdjustStage.ExhaustUnits_6,
        CostAdjustStage.DefeatCredits_7
        // we do not run the increase step during triggering / payment, it was added on during the evaluation pass
    ];
}

export function isInteractiveCostAdjusterStage(stage: CostAdjustStage): boolean {
    switch (stage) {
        case CostAdjustStage.Exploit_2:
        case CostAdjustStage.DamageUnits_3:
        case CostAdjustStage.DefeatResources_4:
        case CostAdjustStage.ExhaustUnits_6:
        case CostAdjustStage.DefeatCredits_7:
            return true;
        case CostAdjustStage.Standard_0:
        case CostAdjustStage.IgnoreWildcard_1:
        case CostAdjustStage.PayStage_5:
        case CostAdjustStage.Increase_8:
            return false;
        default:
            Contract.fail(`Unknown CostAdjustStage value: ${stage}`);
    }
}

/**
 * Stages whose effect may remove a friendly unit from play, which in turn removes any downstream cost adjusters
 * that the unit is the source of (e.g. Exploit defeating The Starhawk). Used when accounting for the "opportunity cost"
 * of a target selection.
 *
 * {@link CostAdjustStage.DamageUnits_3} is not included: whether damage defeats a unit can't be reliably predicted, so
 * it is assumed not to (see `DamageUnitsCostAdjuster`).
 */
export function isUnitRemovingStage(stage: CostAdjustStage): boolean {
    return stage === CostAdjustStage.Exploit_2;
}

export function getExploitedUnits(playEvent: any): ILastKnownInformation[] {
    return Helpers.asArray(playEvent.costs?.['exploit']?.selectedTargets ?? []);
}
