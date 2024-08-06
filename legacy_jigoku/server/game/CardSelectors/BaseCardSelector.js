const { Locations, Players } = require('../Constants');
const _ = require('underscore');

class BaseCardSelector {
    constructor(properties) {
        this.cardCondition = properties.cardCondition;
        this.cardType = properties.cardType;
        this.optional = properties.optional;
        this.location = this.buildLocation(properties.location);
        this.controller = properties.controller || Players.Any;
        this.checkTarget = !!properties.targets;
        this.sameDiscardPile = !!properties.sameDiscardPile;

        if(!Array.isArray(properties.cardType)) {
            this.cardType = [properties.cardType];
        }
    }

    buildLocation(property) {
        let location = property || Locations.PlayArea || [];
        if(!Array.isArray(location)) {
            location = [location];
        }
        let index = location.indexOf(Locations.Provinces);
        if(index > -1) {
            location.splice(
                index,
                1,
                Locations.ProvinceOne,
                Locations.ProvinceTwo,
                Locations.ProvinceThree,
                Locations.ProvinceFour,
                Locations.StrongholdProvince
            );
        }
        return location;
    }

    findPossibleCards(context) {
        let controllerProp = this.controller;
        if(typeof controllerProp === 'function') {
            controllerProp = controllerProp(context);
        }

        if(this.location.includes(Locations.Any)) {
            if(controllerProp === Players.Self) {
                return context.game.allCards.filter((card) => card.controller === context.player);
            } else if(controllerProp === Players.Opponent) {
                return context.game.allCards.filter((card) => card.controller === context.player.opponent);
            }
            return context.game.allCards.toArray();
        }
        let attachments = context.player.cardsInPlay.reduce((array, card) => array.concat(card.attachments), []);
        let allProvinceAttachments = context.player
            .getProvinces()
            .reduce((array, card) => array.concat(card.attachments), []);

        if(context.player.opponent) {
            allProvinceAttachments = allProvinceAttachments.concat(
                context.player.opponent.getProvinces().reduce((array, card) => array.concat(card.attachments), [])
            );
        }

        attachments = attachments.concat(allProvinceAttachments);

        if(context.source.game.rings) {
            let rings = Object.values(context.source.game.rings);
            let allRingAttachments = _.flatten(rings.map((ring) => ring.attachments));
            attachments = attachments.concat(allRingAttachments);
        }
        if(context.player.opponent) {
            attachments = attachments.concat(...context.player.opponent.cardsInPlay.map((card) => card.attachments));
        }
        let possibleCards = [];
        if(controllerProp !== Players.Opponent) {
            possibleCards = this.location.reduce((array, location) => {
                let cards = context.player.getSourceList(location).toArray();
                if(location === Locations.PlayArea) {
                    return array.concat(
                        cards,
                        attachments.filter((card) => card.controller === context.player)
                    );
                }
                return array.concat(cards);
            }, possibleCards);
        }
        if(controllerProp !== Players.Self && context.player.opponent) {
            possibleCards = this.location.reduce((array, location) => {
                let cards = context.player.opponent.getSourceList(location).toArray();
                if(location === Locations.PlayArea) {
                    return array.concat(
                        cards,
                        attachments.filter((card) => card.controller === context.player.opponent)
                    );
                }
                return array.concat(cards);
            }, possibleCards);
        }
        return possibleCards;
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
        if(controllerProp === Players.Self && card.controller !== context.player) {
            return false;
        }
        if(controllerProp === Players.Opponent && card.controller !== context.player.opponent) {
            return false;
        }
        if(!this.location.includes(Locations.Any) && !this.location.includes(card.location)) {
            return false;
        }
        if(card.location === Locations.Hand && card.controller !== choosingPlayer) {
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
