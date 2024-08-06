import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type Ring from '../ring';
import { RingAction, type RingActionProperties } from './RingAction';

export interface ReturnRingToPlayProperties extends RingActionProperties {}

export class ReturnRingToPlayAction extends RingAction {
    name = 'returnRingToPlay';
    eventName = EventNames.OnReturnRingtoPlay;
    effect = 'return the {0} to play';
    constructor(properties: ((context: AbilityContext) => ReturnRingToPlayProperties) | ReturnRingToPlayProperties) {
        super(properties);
    }

    canAffect(ring: Ring, context: AbilityContext): boolean {
        if (!ring.removedFromGame) {
            return false;
        }

        return super.canAffect(ring, context);
    }

    eventHandler(event, additionalProperties): void {
        let ring = event.ring;
        let context = event.context;

        context.game.raiseEvent(EventNames.OnReturnRingtoPlay, { ring: ring }, () => ring.returnRingToPlay());
    }
}
