import { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type Ring from '../ring';
import { RingAction, type RingActionProperties } from './RingAction';

export interface SwitchConflictElementProperties extends RingActionProperties {}

export class SwitchConflictElementAction extends RingAction {
    name = 'switchConflictElement';
    cost = 'switching the contested ring to {0}';
    effect = 'switch the contested ring to {0}';
    eventName = EventNames.OnSwitchConflictElement;

    canAffect(ring: Ring, context: AbilityContext, additionalProperties = {}): boolean {
        return (
            !ring.isRemovedFromGame() &&
            context.game.isDuringConflict() &&
            super.canAffect(ring, context, additionalProperties)
        );
    }

    eventHandler(event): void {
        event.context.game.currentConflict.switchElement(event.ring.element);
    }
}