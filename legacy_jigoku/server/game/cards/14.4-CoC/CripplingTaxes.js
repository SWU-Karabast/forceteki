const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes } = require('../../Constants');

class CripplingTaxes extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard all cards in a province',
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province
            },
            gameAction: AbilityDsl.actions.moveCard(context => ({
                destination: Locations.DynastyDiscardPile,
                target: context.target.controller.getDynastyCardsInProvince(context.target.location)
            })),
            effect: 'discard {1}',
            effectArgs: context => [context.target.controller.getDynastyCardsInProvince(context.target.location)]
        });
    }
}

CripplingTaxes.id = 'crippling-taxes';

module.exports = CripplingTaxes;
