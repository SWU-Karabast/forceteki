import type { AbilityContext } from '../../ability/AbilityContext';
import type { Player } from '../../Player';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import { AbilityRestriction } from '../../Constants';
import type Game from '../../Game';

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

    private static restrictionDescription?(type: string): FormatMessage {
        if (type === AbilityRestriction.Attack) {
            return { format: 'attacking', args: [] };
        } else if (type === AbilityRestriction.Ready) {
            return { format: 'readying', args: [] };
        } else if (type === AbilityRestriction.BeHealed) {
            return { format: 'being healed', args: [] };
        } else if (type === AbilityRestriction.BeAttacked) {
            return { format: 'being attacked', args: [] };
        }

        return undefined;
    }

    public constructor(game: Game, properties: string | RestrictionProperties) {
        const effectDescription = Restriction.restrictionDescription(typeof properties === 'string' ? properties : properties.type);

        super(game, null, effectDescription);

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

    public isMatch(type: string, context: AbilityContext) {
        if (this.type === 'leavePlay') {
            return leavePlayTypes.has(type) && this.checkCondition(context);
        }

        return (!this.type || this.type === type) && this.checkCondition(context);
    }

    public checkCondition(context: AbilityContext) {
        return this.checkRestriction(this.restrictedActionCondition, context);
    }

    public checkRestriction(restriction: ((context: AbilityContext) => boolean) | undefined, context: AbilityContext) {
        if (!restriction) {
            return true;
        } else if (!context) {
            throw new Error('checkRestriction called without a context');
        }
        return restriction(context);
    }
}
