const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { Locations } = require('../../../Constants');

class EloquentAdvocate extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Look at top 2 cards of conflict deck',
            effect: 'look at the top two cards of their conflict deck',
            when: {
                afterConflict: (event, context) => event.conflict.winner === context.source.controller && context.source.isParticipating() &&
                                                   event.conflict.conflictType === 'political'
            },
            gameAction: AbilityDsl.actions.deckSearch({
                amount: 2,
                gameAction: AbilityDsl.actions.moveCard({
                    destination: Locations.Hand
                }),
                shuffle: false,
                reveal: false,
                placeOnBottomInRandomOrder: true
            })
        });
    }
}

EloquentAdvocate.id = 'eloquent-advocate';
module.exports = EloquentAdvocate;

