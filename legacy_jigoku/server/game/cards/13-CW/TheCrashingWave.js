const DrawCard = require('../../drawcard.js');
const { CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class TheCrashingWave extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Move the conflict',
            when: {
                onTheCrashingWave: (event, context) => event.conflict.defendingPlayer === context.player
            },
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                gameAction: AbilityDsl.actions.moveConflict()
            }
        });
    }
}

TheCrashingWave.id = 'the-crashing-wave';

module.exports = TheCrashingWave;
