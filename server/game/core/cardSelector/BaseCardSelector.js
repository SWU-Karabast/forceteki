const { Location, RelativePlayer, WildcardLocation } = require('../Constants');
const { default: Contract } = require('../utils/Contract');
const { cardLocationMatches } = require('../utils/EnumHelpers');

// TODO: once converted to TS, make this abstract
class BaseCardSelector {
    constructor(properties) {
        // TODO: remove this once we feel confident we've finished the rename pass successfully
        if (!Contract.assertFalse('location' in properties, 'Attempting to create an effect with the \'location\' property, instead should be using the \'locationFilter\' property')) {
            // just to catch any accidental use of the 'location' property we missed when doing the refactor to naming 'locationFilter'
            throw Error('Attempting to create an effect with the \'location\' property, instead should be using the \'locationFilter\' property');
        }

        this.cardCondition = properties.cardCondition;
        this.cardType = properties.cardType;
        this.optional = properties.optional;
        this.locationFilter = this.buildLocationFilter(properties.locationFilter);
        this.controller = properties.controller || RelativePlayer.Any;
        this.checkTarget = !!properties.targets;
        this.sameDiscardPile = !!properties.sameDiscardPile;

        if (!Array.isArray(properties.cardType)) {
            this.cardType = [properties.cardType];
        }
    }

    buildLocationFilter(property) {
        let locationFilter = property || WildcardLocation.AnyAttackable || [];
        if (!Array.isArray(locationFilter)) {
            locationFilter = [locationFilter];
        }
        return locationFilter;
    }

    findPossibleCards(context) {
        let controllerProp = this.controller;
        if (typeof controllerProp === 'function') {
            controllerProp = controllerProp(context);
        }

        if (this.locationFilter.includes(WildcardLocation.Any)) {
            if (controllerProp === RelativePlayer.Self) {
                return context.game.allCards.filter((card) => card.controller === context.player);
            } else if (controllerProp === RelativePlayer.Opponent) {
                return context.game.allCards.filter((card) => card.controller === context.player.opponent);
            }
            return context.game.allCards.toArray();
        }

        let upgradesInPlay = context.player.getCardsInPlay().reduce((array, card) => array.concat(card.upgrades), []);

        if (context.player.opponent) {
            upgradesInPlay = upgradesInPlay.concat(...context.player.opponent.getCardsInPlay().map((card) => card.upgrades));
        }

        let possibleCards = [];
        if (controllerProp !== RelativePlayer.Opponent) {
            possibleCards = this.locationFilter.reduce(
                (array, locationFilter) => array.concat(this.getCardsForPlayerLocations(locationFilter, context.player, upgradesInPlay)), possibleCards
            );
        }
        if (controllerProp !== RelativePlayer.Self && context.player.opponent) {
            possibleCards = this.locationFilter.reduce(
                (array, locationFilter) => array.concat(this.getCardsForPlayerLocations(locationFilter, context.player.opponent, upgradesInPlay)), possibleCards
            );
        }
        return possibleCards;
    }

    getCardsForPlayerLocations(location, player, upgrades) {
        var cards;
        switch (location) {
            case WildcardLocation.Any:
                // TODO: is this ever a case we should have? this would allow targeting deck, discard, etc.
                throw Error('WildcardLocation.Any is currently not supported for card selectors');
            case WildcardLocation.AnyArena:
                cards = player.getCardsInPlay();
                break;
            case WildcardLocation.AnyAttackable:
                cards = player.getCardsInPlay();
                cards = cards.concat(player.getCardPile(Location.Base));
                break;
            default:
                cards = player.getCardPile(location);
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
        if (typeof controllerProp === 'function') {
            controllerProp = controllerProp(context);
        }

        if (!card) {
            return false;
        }

        if (this.sameDiscardPile && selectedCards.length > 0) {
            return card.location === selectedCards[0].location && card.owner === selectedCards[0].owner;
        }

        if (this.checkTarget && !card.canBeTargeted(context, selectedCards)) {
            return false;
        }
        if (controllerProp === RelativePlayer.Self && card.controller !== context.player) {
            return false;
        }
        if (controllerProp === RelativePlayer.Opponent && card.controller !== context.player.opponent) {
            return false;
        }
        if (!cardLocationMatches(card.location, this.locationFilter)) {
            return false;
        }
        if (card.location === Location.Hand && card.controller !== choosingPlayer) {
            return false;
        }
        return card.hasSomeType(this.cardType) && this.cardCondition(card, context);
    }

    getAllLegalTargets(context, choosingPlayer) {
        return this.findPossibleCards(context).filter((card) => this.canTarget(card, context, choosingPlayer));
    }


    hasEnoughSelected(selectedCards, context) {
        return this.optional || selectedCards.length > 0;
    }

    hasEnoughTargets(context, choosingPlayer) {
        return this.findPossibleCards(context).some((card) => this.canTarget(card, context, choosingPlayer));
    }


    defaultActivePromptTitle(context) {
        return 'Choose cards';
    }


    automaticFireOnSelect(context) {
        return false;
    }


    wouldExceedLimit(selectedCards, card) {
        return false;
    }


    hasReachedLimit(selectedCards, context) {
        return false;
    }


    hasExceededLimit(selectedCards, context) {
        return false;
    }

    formatSelectParam(cards) {
        return cards;
    }
}

module.exports = BaseCardSelector;
