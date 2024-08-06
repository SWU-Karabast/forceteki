const DrawCard = require('../../drawcard.js');
const { Phases, CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class InspiredVisionary extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Bow to discard an attachment',
            when: {
                onPhaseStarted: event => event.phase === Phases.Fate
            },
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Attachment,
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.returnToDeck(context => ({
                        target: context.target,
                        destination: Locations.ConflictDeck,
                        shuffle: true
                    })),
                    AbilityDsl.actions.draw(context => ({
                        target: context.target.owner
                    }))
                ])
            }
        });
    }
}

InspiredVisionary.id = 'inspired-visionary';

module.exports = InspiredVisionary;


