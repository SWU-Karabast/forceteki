const { Location, RelativePlayer, WildcardLocation } = require('../Constants');
const { cardLocationMatches } = require('../utils/EnumHelpers');
const _ = require('underscore');

// TODO: once converted to TS, make this abstract
class BaseCardSelector {
    constructor(properties) {
        this.cardCondition = properties.cardCondition;
        this.cardType = properties.cardType;
        this.optional = properties.optional;
        this.location = this.buildLocation(properties.location);
        this.controller = properties.controller || RelativePlayer.Any;
        this.checkTarget = !!properties.targets;
        this.sameDiscardPile = !!properties.sameDiscardPile;

        if(!Array.isArray(properties.cardType)) {
            this.cardType = [properties.cardType];
        }
    }

    buildLocation(property) {
        let location = property || WildcardLocation.AnyArena || [];
        if(!Array.isArray(location)) {
            location = [location];
        }
        return location;
    }

    findPossibleCards(context) {
        let controllerProp = this.controller;
        if(typeof controllerProp === 'function') {
            controllerProp = controllerProp(context);
        }

        if(this.location.includes(WildcardLocation.Any)) {
            if(controllerProp === RelativePlayer.Self) {
                return context.game.allCards.filter((card) => card.controller === context.player);
            } else if(controllerProp === RelativePlayer.Opponent) {
                return context.game.allCards.filter((card) => card.controller === context.player.opponent);
            }
            return context.game.allCards.toArray();
        }

        let upgradesInPlay = context.player.getCardsInPlay().reduce((array, card) => array.concat(card.upgrades), []);

        if(context.player.opponent) {
            upgradesInPlay = upgradesInPlay.concat(...context.player.opponent.getCardsInPlay().map((card) => card.upgrades));
        }

        let possibleCards = [];
        if(controllerProp !== RelativePlayer.Opponent) {
            possibleCards = this.location.reduce(
                (array, location) => array.concat(this.getCardsForPlayerLocation(location, context.player, upgradesInPlay)), possibleCards
            );
        }
        if(controllerProp !== RelativePlayer.Self && context.player.opponent) {
            possibleCards = this.location.reduce(
                (array, location) => array.concat(this.getCardsForPlayerLocation(location, context.player.opponent, upgradesInPlay)), possibleCards
            );
        }
        return possibleCards;
    }

    getCardsForPlayerLocation(location, player, upgrades) {
        var cards;
        switch (location) {
            case WildcardLocation.AnyArena:
                cards = player.getCardsInPlay().toArray();
                break;
            case WildcardLocation.AnyAttackable:
                cards = player.getCardsInPlay().toArray();
                cards = cards.concat(player.getSourceListForPile(Location.Base).toArray());
                break;
            default:
                cards = player.getSourceListForPile(location).toArray();
                break;
        }

        // TODO: proper upgrade search within arena instead of across both arenas
        // if(location === WildcardLocation.AnyArena) {
        //     return array.concat(
        //         cards,
        //         upgrades.filter((card) => card.controller === context.player.opponent)
        //     );
        // }

        return cards;
    }


    canTarget(card, context, choosingPlayer, selectedCards = []) {
        let controllerProp = this.controller;
        if(typeof controllerProp === 'function') {
            controllerProp = controllerProp(context);
        }

        if(!card) {
            return false;
        }

        if(this.sameDiscardPile && selectedCards.length > 0) {
            return card.location === selectedCards[0].location && card.owner === selectedCards[0].owner;
        }

        if(this.checkTarget && !card.canBeTargeted(context, selectedCards)) {
            return false;
        }
        if(controllerProp === RelativePlayer.Self && card.controller !== context.player) {
            return false;
        }
        if(controllerProp === RelativePlayer.Opponent && card.controller !== context.player.opponent) {
            return false;
        }
        if(!cardLocationMatches(card.location, this.location)) {
            return false;
        }
        if(card.location === Location.Hand && card.controller !== choosingPlayer) {
            return false;
        }
        return this.cardType.includes(card.getType()) && this.cardCondition(card, context);
    }

    getAllLegalTargets(context, choosingPlayer) {
        return this.findPossibleCards(context).filter((card) => this.canTarget(card, context, choosingPlayer));
    }

    // eslint-disable-next-line no-unused-vars
    hasEnoughSelected(selectedCards, context) {
        return this.optional || selectedCards.length > 0;
    }

    hasEnoughTargets(context, choosingPlayer) {
        return this.findPossibleCards(context).some((card) => this.canTarget(card, context, choosingPlayer));
    }

    // eslint-disable-next-line no-unused-vars
    defaultActivePromptTitle(context) {
        return 'Choose cards';
    }

    // eslint-disable-next-line no-unused-vars
    automaticFireOnSelect(context) {
        return false;
    }

    // eslint-disable-next-line no-unused-vars
    wouldExceedLimit(selectedCards, card) {
        return false;
    }

    // eslint-disable-next-line no-unused-vars
    hasReachedLimit(selectedCards, context) {
        return false;
    }

    // eslint-disable-next-line no-unused-vars
    hasExceededLimit(selectedCards, context) {
        return false;
    }

    formatSelectParam(cards) {
        return cards;
    }
}

module.exports = BaseCardSelector;
