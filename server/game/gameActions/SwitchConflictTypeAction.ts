import type { AbilityContext } from '../AbilityContext';
import { ConflictTypes, EventNames } from '../Constants';
import type Ring from '../ring';
import { RingAction, type RingActionProperties } from './RingAction';

export interface SwitchConflictTypeProperties extends RingActionProperties {
    targetConflictType?: ConflictTypes;
}

export class SwitchConflictTypeAction extends RingAction<SwitchConflictTypeProperties> {
    name = 'switchConflictType';
    eventName = EventNames.OnSwitchConflictType;

    getCostMessage(context: AbilityContext): [string, any[]] {
        let currentConflictType = context.game.currentConflict && context.game.currentConflict.conflictType;
        let newConflictType =
            currentConflictType === ConflictTypes.Military ? ConflictTypes.Political : ConflictTypes.Military;
        return ['switching the conflict type from {0} to {1}', [currentConflictType, newConflictType]];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let currentConflictType = context.game.currentConflict && context.game.currentConflict.conflictType;
        let newConflictType =
            currentConflictType === ConflictTypes.Military ? ConflictTypes.Political : ConflictTypes.Military;
        return ['switch the conflict type from {0} to {1}', [currentConflictType, newConflictType]];
    }

    canAffect(ring: Ring, context: AbilityContext, additionalProperties = {}) {
        if (!context.game.currentConflict) {
            return false;
        }
        let { targetConflictType } = this.getProperties(context);
        return ring.conflictType !== targetConflictType;
    }

    eventHandler(event): void {
        event.context.game.currentConflict.switchType();
    }
}
