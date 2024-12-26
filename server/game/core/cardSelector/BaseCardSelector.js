const { ZoneName, RelativePlayer, WildcardZoneName, WildcardRelativePlayer } = require('../Constants');
const Contract = require('../utils/Contract');
const EnumHelpers = require('../utils/EnumHelpers');
const Helpers = require('../utils/Helpers');

// TODO: once converted to TS, make this abstract.
class BaseCardSelector {
    constructor(properties) {
        this.cardCondition = properties.cardCondition;
        this.multiSelectCardCondition = properties.multiSelectCardCondition;
        this.cardTypeFilter = properties.cardTypeFilter;
        this.optional = properties.optional;
        this.zoneFilter = this.buildZoneFilter(properties.zoneFilter);
        this.capturedByFilter = properties.capturedByFilter;
        this.controller = properties.controller || WildcardRelativePlayer.Any;
        this.checkTarget = !!properties.checkTarget;
        this.appendToDefaultTitle = properties.appendToDefaultTitle;

        if (!Array.isArray(properties.cardTypeFilter)) {
            this.cardTypeFilter = [properties.cardTypeFilter];
        }
    }

    get hasAnyCardFilter() {
        return this.cardTypeFilter || this.cardCondition || this.multiSelectCardCondition;
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
                (array, zoneFilter) => array.concat(this.getCardsForPlayerZones(zoneFilter, context.player, context.game)), possibleCards
            );
        }
        if (controllerProp !== RelativePlayer.Self && context.player.opponent) {
            possibleCards = this.zoneFilter.reduce(
                (array, zoneFilter) => array.concat(this.getCardsForPlayerZones(zoneFilter, context.player.opponent, context.game)), possibleCards
            );
        }

        possibleCards = this.filterCaptureZones(possibleCards, context);

        return possibleCards;
    }

    filterCaptureZones(possibleCards, context) {
        // get cards from capture zones, if any
        const concreteCaptors = Helpers.asArray(
            typeof this.capturedByFilter === 'function'
                ? this.capturedByFilter(context)
                : this.capturedByFilter
        );

        if (concreteCaptors.length === 0) {
            return possibleCards;
        }

        if (!this.zoneFilter.includes(ZoneName.Capture)) {
            Contract.fail('Cannot use the \'capturedByFilter\' property without specifying \'ZoneName.Capture\' in the zoneFilter');
        }

        for (const captor of concreteCaptors) {
            Contract.assertTrue(captor.isUnit(), `Attempting to target capture zone for ${captor.internalName} but it is not a unit`);
            Contract.assertTrue(captor.isInPlay(), `Attempting to target capture zone for ${captor.internalName} but it is in non-play zone ${captor.zoneName}`);
        }

        return possibleCards.filter((card) => card.zoneName !== ZoneName.Capture || concreteCaptors.includes(card.getCaptor()));
    }

    getCardsForPlayerZones(zone, player, game) {
        var cards;
        switch (zone) {
            case WildcardZoneName.Any:
                // TODO: is this ever a case we should have? this would allow targeting deck, discard, etc.
                throw Error('WildcardZoneName.Any is currently not supported for card selectors');
            case WildcardZoneName.AnyArena:
                cards = player.getArenaCards();
                break;
            case WildcardZoneName.AnyAttackable:
                cards = [].concat(player.getArenaCards());
                cards = cards.concat(player.baseZone.cards);
                break;
            case ZoneName.Capture:
                cards = game.allArenas.getUnitCards().flatMap((card) => card.capturedUnits);
                cards = cards.filter((card) => card.owner === player);
                break;
            default:
                cards = player.getCardsInZone(zone);
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

        if (this.checkTarget && !card.canBeTargeted(context, selectedCards)) {
            return false;
        }
        if (controllerProp === RelativePlayer.Self && card.controller !== context.player) {
            return false;
        }
        if (controllerProp === RelativePlayer.Opponent && card.controller !== context.player.opponent) {
            return false;
        }
        if (!EnumHelpers.cardZoneMatches(card.zoneName, this.zoneFilter) && card.zoneName !== ZoneName.Capture) {
            return false;
        }
        if (card.zoneName === ZoneName.Hand && card.controller !== choosingPlayer) {
            return false;
        }
        return EnumHelpers.cardTypeMatches(card.type, this.cardTypeFilter) && this.cardConditionsAreSatisfied(card, selectedCards, context);
    }

    cardConditionsAreSatisfied(card, selectedCards, context) {
        const cardConditionPassed = !this.cardCondition || this.cardCondition(card, context);
        const multiSelectConditionPassed = !this.multiSelectCardCondition || this.multiSelectCardCondition(card, selectedCards, context);
        return cardConditionPassed && multiSelectConditionPassed;
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
        return this.defaultPromptString(context) + (this.appendToDefaultTitle ? ' ' + this.appendToDefaultTitle : '');
    }

    defaultPromptString(context) {
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
