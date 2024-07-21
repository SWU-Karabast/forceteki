import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';
import type { StatusToken } from '../StatusToken';
import { TokenAction, type TokenActionProperties } from './TokenAction';

export interface DiscardStatusProperties extends TokenActionProperties {}

export class DiscardStatusAction extends TokenAction<DiscardStatusProperties> {
    name = 'discardStatus';
    eventName = EventNames.OnStatusTokenDiscarded;
    cost = 'discarding a status token';

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context);
        if (properties.target) {
            let targets = properties.target;
            if (!Array.isArray(targets)) {
                targets = [targets];
            }
            let cards = targets.map((a) => {
                let token = a as StatusToken;
                if (token) return token.card;
                return a;
            });
            return ["discard {0}'s status token", cards];
        }
        return ['discard a status token', []];
    }

    eventHandler(event): void {
        let tokens = event.token;
        if (!Array.isArray(tokens)) {
            tokens = [tokens];
        }
        tokens.forEach((token) => token.card.removeStatusToken(token));
    }
}