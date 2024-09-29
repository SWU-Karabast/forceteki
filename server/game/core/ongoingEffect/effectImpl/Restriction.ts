import { AbilityContext } from '../../ability/AbilityContext';
import Player from '../../Player';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import { restrictionDsl } from '../../../ongoingEffects/RestrictionDsl';
import type { Card } from '../../card/Card';

const leavePlayTypes = new Set(['discardFromPlay', 'returnToHand', 'returnToDeck', 'removeFromGame']);

export interface RestrictionProperties {
    type: string;
    cannot?: string;
    applyingPlayer?: Player;
    restrictedActionCondition?: (context: AbilityContext) => boolean;
    source?: Card;
    params?: any;
}

export class Restriction extends OngoingEffectValueWrapper<Restriction> {
    public readonly type: string;
    public restrictedActionCondition?: (context: AbilityContext) => boolean;
    public applyingPlayer?: Player;
    public params?: any;

    public constructor(properties: string | RestrictionProperties) {
        super(null);
        if (typeof properties === 'string') {
            this.type = properties;
        } else {
            this.type = properties.type;
            this.restrictedActionCondition = properties.restrictedActionCondition;
            this.applyingPlayer = properties.applyingPlayer;
            this.params = properties.params;
        }
    }

    public override getValue() {
        return this;
    }

    public isMatch(type, context, card) {
        if (this.type === 'leavePlay') {
            return leavePlayTypes.has(type) && this.checkCondition(context, card);
        }

        return (!this.type || this.type === type) && this.checkCondition(context, card);
    }

    public checkCondition(context, card) {
        if (Array.isArray(this.restrictedActionCondition)) {
            const vals = this.restrictedActionCondition.map((a) => this.checkRestriction(a, context, card));
            return vals.every((a) => a);
        }

        return this.checkRestriction(this.restrictedActionCondition, context, card);
    }

    public checkRestriction(restriction, context, card) {
        if (!restriction) {
            return true;
        } else if (!context) {
            throw new Error('checkRestriction called without a context');
        } else if (typeof restriction === 'function') {
            return restriction(context, this, card);
        } else if (!restrictionDsl[restriction]) {
            return context.source.hasSomeTrait(restriction);
        }
        return restrictionDsl[restriction](context, this, card);
    }
}
