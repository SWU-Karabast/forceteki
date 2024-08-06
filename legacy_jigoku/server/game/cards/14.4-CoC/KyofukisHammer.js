const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes } = require('../../Constants');

class KyofukisHammer extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Discard a card from a province',
            when: {
                afterConflict: (event, context) => context.source.parent && context.source.parent.isParticipating() &&
                                                    event.conflict.winner === context.source.parent.controller
            },
            limit: AbilityDsl.limit.unlimitedPerConflict(),
            target: {
                location: Locations.Provinces,
                cardType: [CardTypes.Character, CardTypes.Holding, CardTypes.Event],
                gameAction: AbilityDsl.actions.moveCard({ destination: Locations.DynastyDiscardPile })
            }
        });
    }
}

KyofukisHammer.id = 'kyofuki-s-hammer';

module.exports = KyofukisHammer;

