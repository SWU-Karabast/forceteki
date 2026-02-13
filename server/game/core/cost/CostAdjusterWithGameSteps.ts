import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import { CostAdjuster } from './CostAdjuster';
import type { ICostAdjustTriggerResult } from './CostInterfaces';
import type { ICostResult } from './ICost';
import * as CostHelpers from './CostHelpers';
import * as Contract from '../../core/utils/Contract';

import { registerState } from '../GameObjectUtils';

/**
 * ABC for cost adjusters that require game steps to execute during cost adjustment.
 */
@registerState()
export abstract class CostAdjusterWithGameSteps extends CostAdjuster {
    public override requiresGameSteps(): this is CostAdjusterWithGameSteps {
        return true;
    }

    public abstract queueGenerateEventGameSteps(
        events: any[],
        context: AbilityContext<Card>,
        costAdjustTriggerResult: ICostAdjustTriggerResult,
        abilityCostResult?: ICostResult
    );

    public override checkApplyCostAdjustment(card: Card, context: AbilityContext, triggerResult: ICostAdjustTriggerResult): void {
        Contract.assertFalse(CostHelpers.isInteractiveCostAdjusterStage(this.costAdjustStage), `Interactive cost adjuster stages should not use checkApplyCostAdjustment: '${this.costAdjustStage}'`);
    }
}