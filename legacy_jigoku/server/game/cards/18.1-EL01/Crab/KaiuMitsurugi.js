const DrawCard = require('../../../drawcard.js');
const { Locations, Players, CardTypes } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class KaiuMitsurugi extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Self,
            match: card => card.type === CardTypes.Holding,
            targetLocation: Locations.Any,
            effect: AbilityDsl.effects.addKeyword('rally')
        });

        this.action({
            title: 'Draw a card and gain a fate',
            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Holding
            }),
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.gainFate(context => ({
                    target: context.player
                })),
                AbilityDsl.actions.draw(context => ({
                    target: context.player
                }))
            ]),
            effect: 'gain 1 fate and draw 1 card'
        });
    }
}

KaiuMitsurugi.id = 'kaiu-mitsurugi';

module.exports = KaiuMitsurugi;
