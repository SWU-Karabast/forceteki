const { ZoneName, RelativePlayer, WildcardZoneName } = require('../Constants');
const Contract = require('../utils/Contract');
const EnumHelpers = require('../utils/EnumHelpers');

// TODO: once converted to TS, make this abstract.
class BaseCardSelector {
    constructor(properties) {
        this.cardCondition = properties.cardCondition;
        this.cardTypeFilter = properties.cardTypeFilter;
        this.optional = properties.optional;
        this.zoneFilter = this.buildZoneFilter(properties.zoneFilter);
        this.controller = properties.controller || RelativePlayer.Any;
        this.checkTarget = !!properties.checkTarget;
        this.sameDiscardPile = !!properties.sameDiscardPile;

        if (!Array.isArray(properties.cardTypeFilter)) {
            this.cardTypeFilter = [properties.cardTypeFilter];
        }
    }

    get hasAnyCardFilter() {
        return this.cardTypeFilter || this.cardCondition;
    }

    buildZoneFilter(property) {
        let zoneFilter = property || WildcardZoneName.AnyAttackable || [];
        if (!Array.isArray(zoneFilter)) {
            zoneFilter = [zoneFilter];
        }
        return zoneFilter;
    }

    findPossibleCards(context) {
        let controllerProp = this.controller;
        if (typeof controllerProp === 'function') {
            controllerProp = controllerProp(context);
        }

        if (this.zoneFilter.includes(WildcardZoneName.Any)) {
            if (controllerProp === RelativePlayer.Self) {
                return context.game.allCards.filter((card) => card.controller === context.player);
            } else if (controllerProp === RelativePlayer.Opponent) {
                return context.game.allCards.filter((card) => card.controller === context.player.opponent);
            }
            return context.game.allCards;
        }

        let possibleCards = [];
        if (controllerProp !== RelativePlayer.Opponent) {
            possibleCards = this.zoneFilter.reduce(
                (array, zoneFilter) => array.concat(this.getCardsForPlayerZones(zoneFilter, context.player)), possibleCards
            );
        }
        if (controllerProp !== RelativePlayer.Self && context.player.opponent) {
            possibleCards = this.zoneFilter.reduce(
                (array, zoneFilter) => array.concat(this.getCardsForPlayerZones(zoneFilter, context.player.opponent)), possibleCards
            );
        }
        return possibleCards;
    }

    getCardsForPlayerZones(zone, player) {
        var cards;
        switch (zone) {
            case WildcardZoneName.Any:
                // TODO: is this ever a case we should have? this would allow targeting deck, discard, etc.
                throw Error('WildcardZoneName.Any is currently not supported for card selectors');
            case WildcardZoneName.AnyArena:
                cards = player.getArenaCards();
                break;
            case WildcardZoneName.AnyAttackable:
                cards = player.getArenaCards();
                cards = cards.concat(player.getCardPile(ZoneName.Base));
                break;
            default:
                cards = player.getCardPile(zone);
                break;
        }

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
            return card.zoneName === selectedCards[0].zoneName && card.owner === selectedCards[0].owner;
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
        if (!EnumHelpers.cardZoneMatches(card.zoneName, this.zoneFilter)) {
            return false;
        }
        if (card.zoneName === ZoneName.Hand && card.controller !== choosingPlayer) {
            return false;
        }
        return EnumHelpers.cardTypeMatches(card.type, this.cardTypeFilter) && this.cardCondition(card, context);
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
