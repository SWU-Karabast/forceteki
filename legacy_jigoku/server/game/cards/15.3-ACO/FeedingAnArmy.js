const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Phases } = require('../../Constants.js');

class FeedingAnArmy extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Put fate on characters',
            when: {
                onPhaseStarted: (event) => event.phase === Phases.Conflict
            },
            cost: [AbilityDsl.costs.breakProvince({ cardCondition: (card) => card.isFaceup() })],
            gameAction: AbilityDsl.actions.placeFate((context) => ({
                target: context.player.cardsInPlay.filter((card) => card.costLessThan(4))
            }))
        });
    }
}

FeedingAnArmy.id = 'feeding-an-army';

module.exports = FeedingAnArmy;
