import type { AbilityContext } from '../AbilityContext';
import { EventNames, Locations } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';

export interface MatchingDiscardProperties extends PlayerActionProperties {
    amount?: number;
    reveal?: boolean;
    cards?: any;
    match?: (context, card) => boolean;
}

export class MatchingDiscardAction extends PlayerAction {
    defaultProperties: MatchingDiscardProperties = {
        amount: -1,
        reveal: false,
        cards: null,
        match: () => true
    };

    name = 'discard';
    eventName = EventNames.OnCardsDiscardedFromHand;
    constructor(propertyFactory: MatchingDiscardProperties | ((context: AbilityContext) => MatchingDiscardProperties)) {
        super(propertyFactory);
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties: MatchingDiscardProperties = this.getProperties(context) as MatchingDiscardProperties;
        return ['make {0} discard all cards that match a condition', [properties.target]];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        return player.hand.size() > 0 && super.canAffect(player, context);
    }

    addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        let properties: MatchingDiscardProperties = this.getProperties(
            context,
            additionalProperties
        ) as MatchingDiscardProperties;
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = properties.amount;
        event.reveal = properties.reveal;
        event.cards = properties.cards;
        event.match = properties.match;
    }

    eventHandler(event): void {
        let context = event.context;
        let player = event.player;
        let amount = Math.min(event.amount, player.hand.size());
        if (amount < 0) {
            amount = player.hand.size(); //ensure we discard all matching copies
        }

        if (amount === 0) {
            return;
        }
        let cards = event.cards;
        let cardsToDiscard = cards.filter((a) => event.match(context, a));
        if (amount < cardsToDiscard.length) {
            cardsToDiscard = cardsToDiscard.slice(0, amount);
        }
        event.cards = cardsToDiscard;
        event.discardedCards = cardsToDiscard;
        if (event.reveal) {
            player.game.addMessage('{0} reveals {1}', player, cards);
        }
        if (cardsToDiscard.length > 0) {
            player.game.addMessage('{0} discards {1}', player, cardsToDiscard);
        } else {
            player.game.addMessage('{0} does not discard anything', player);
        }

        for (const card of cardsToDiscard) {
            player.moveCard(card, card.isDynasty ? Locations.DynastyDiscardPile : Locations.ConflictDiscardPile);
        }
    }
}
