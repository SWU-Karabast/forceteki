import type { AbilityContext } from '../../ability/AbilityContext';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import type { FormatMessage } from '../../chat/GameChat';
import { AbilityRestriction } from '../../Constants';
import type { Card } from '../../card/Card';
import type Game from '../../Game';
import * as Contract from '../../utils/Contract';

const leavePlayTypes = new Set(['discardFromPlay', 'returnToHand', 'returnToDeck', 'removeFromGame']);

export interface RestrictionProperties {
    type: string;
    restrictedActionCondition?: (context: AbilityContext, source: Card) => boolean;
}

export class Restriction extends OngoingEffectValueWrapper<Restriction> {
    public readonly type: string;
    public restrictedActionCondition?: (context: AbilityContext, source: Card) => boolean;

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

    public checkRestriction(restrictedActionCondition: ((context: AbilityContext, source: Card) => boolean) | undefined, context: AbilityContext) {
        if (!restrictedActionCondition) {
            return true;
        }

        // TODO: there are some flows that get us here which pass in a null context through GameObject.hasRestriction(),
        // so we need better typing to enforce that we can't hit this in cases where this is a restrictedActionCondition
        Contract.assertNotNullLike(context, `Attempted checking a restrictedActionCondition on a restriction of type '${this.type}' without an AbilityContext.`);

        return restrictedActionCondition(context, this.context.source);
    }
}
