import type { AbilityContext } from '../AbilityContext';
import { CharacterStatus, EventNames, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import type { StatusToken } from '../StatusToken';
import { TokenAction, type TokenActionProperties } from './TokenAction';

export interface MoveTokenProperties extends TokenActionProperties {
    recipient: DrawCard;
}

export class MoveTokenAction extends TokenAction {
    name = 'moveStatusToken';
    eventName = EventNames.OnStatusTokenMoved;

    getEffectMessage(context: AbilityContext, additionalProperties = {}): [string, any[]] {
        const { target, recipient } = this.getProperties(context, additionalProperties) as MoveTokenProperties;
        let card = undefined;
        if (Array.isArray(target)) {
            card = (target[0] as StatusToken).card;
        } else {
            card = (target as StatusToken).card;
        }
        return ["move {0}'s {1} to {2}", [card, target, recipient]];
    }

    canAffect(token: StatusToken, context: AbilityContext, additionalProperties = {}): boolean {
        const { recipient } = this.getProperties(context) as MoveTokenProperties;
        if (!recipient || recipient.location !== Locations.PlayArea) {
            return false;
        } else if (
            token.grantedStatus === CharacterStatus.Honored &&
            (recipient.isHonored || !recipient.checkRestrictions('receiveHonorToken', context))
        ) {
            return false;
        } else if (
            token.grantedStatus === CharacterStatus.Dishonored &&
            (recipient.isDishonored || !recipient.checkRestrictions('receiveDishonorToken', context))
        ) {
            return false;
        } else if (
            token.grantedStatus === CharacterStatus.Tainted &&
            (recipient.isTainted || !recipient.checkRestrictions('receiveTaintedToken', context))
        ) {
            return false;
        }
        return super.canAffect(token, context, additionalProperties);
    }

    addPropertiesToEvent(event, token: StatusToken, context: AbilityContext, additionalProperties = {}): void {
        const { recipient } = this.getProperties(context) as MoveTokenProperties;
        super.addPropertiesToEvent(event, token, context, additionalProperties);
        event.recipient = recipient;
    }

    eventHandler(event): void {
        let tokens = event.token;
        if (!Array.isArray(tokens)) {
            tokens = [tokens];
        }
        tokens.forEach((token) => {
            token.card.removeStatusToken(token);
            event.recipient.addStatusToken(token);
            event.recipient.game.raiseEvent(EventNames.OnStatusTokenGained, { token: token, card: event.recipient });
        });
    }
}
