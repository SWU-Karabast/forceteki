import type { AbilityContext } from './AbilityContext';
import BaseCard from './basecard';
import { EffectNames } from './Constants';
import type Player from './player';

const illegalActions = new Set([
    'bow',
    'ready',
    'dishonor',
    'honor',
    'sacrifice',
    'discardFromPlay',
    'moveToConflict',
    'sendHome',
    'putIntoPlay',
    'putIntoConflict',
    'break',
    'returnToHand',
    EffectNames.TakeControl,
    'placeFate',
    'removeFate'
]);

export class RoleCard extends BaseCard {
    influenceModifier = 0;
    isRole = true;

    getInfluence(): number {
        return this.cardData.influence_pool + this.influenceModifier;
    }

    flipFaceup(): void {
        this.facedown = false;
    }

    getSummary(activePlayer: Player, hideWhenFaceup = false) {
        const baseSummary = super.getSummary(activePlayer, hideWhenFaceup);
        return {
            ...baseSummary,
            isRole: this.isRole,
            location: this.location
        };
    }

    allowGameAction(actionType: string, context?: AbilityContext): boolean {
        return !illegalActions.has(actionType) && super.allowGameAction(actionType, context);
    }

    getElement() {
        return [];
    }
}
