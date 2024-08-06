const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes } = require('../../Constants');

class EducatedHeimin extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true
        });

        this.persistentEffect({
            condition: context => !!context.source.parent,
            targetLocation: Locations.Provinces,
            match: (card, context) => card === context.source.parent,
            effect: AbilityDsl.effects.customRefillProvince((player, province) => {
                let cards = [];
                if(province.isFacedown()) {
                    cards = player.dynastyDeck.first(4);
                } else {
                    cards = player.dynastyDeck.first(2);
                }

                this.game.promptWithHandlerMenu(player, {
                    activePromptTitle: 'Choose a card to refill the province with',
                    cards: cards,
                    cardHandler: cardFromDeck => {
                        let provinceLocation = province.location;
                        player.moveCard(cardFromDeck, provinceLocation);
                        cardFromDeck.facedown = true;
                        cards.splice(cards.indexOf(cardFromDeck), 1);
                        cards.forEach(card => {
                            player.moveCard(card, Locations.DynastyDiscardPile);
                        });
                        this.game.addMessage('{0} chooses a card to put into {1} and discards {2} from the constant effect of Educated Heimin', player, province.isFacedown() ? 'a facedown province' : province.name, cards);
                    }
                });
            })
        });
    }

    canPlayOn(source) {
        return source && source.getType() === 'province' && source.controller === this.controller && !source.isBroken && this.getType() === CardTypes.Attachment;
    }

    canAttach(parent) {
        if(parent.type === CardTypes.Province && parent.isBroken) {
            return false;
        }

        if(parent.controller !== this.controller) {
            return false;
        }

        return parent && parent.getType() === CardTypes.Province && this.getType() === CardTypes.Attachment;
    }
}

EducatedHeimin.id = 'educated-heimin';

module.exports = EducatedHeimin;
