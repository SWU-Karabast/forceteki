import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type Ring from '../ring';
import { RingAction, type RingActionProperties } from './RingAction';

export interface ReturnRingProperties extends RingActionProperties {}

export class ReturnRingAction extends RingAction {
    name = 'returnRing';
    eventName = EventNames.OnReturnRing;
    effect = 'return {0} to the unclaimed pool';

    canAffect(ring: Ring, context: AbilityContext): boolean {
        return !ring.isUnclaimed() && super.canAffect(ring, context);
    }

    eventHandler(event): void {
        event.ring.resetRing();
    }
}
