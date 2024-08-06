const DrawCard = require('../../drawcard.js');
const { Phases } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class PiousGuardian extends DrawCard {
    setupCardAbilities() {
        this.interrupt({
            title: 'Gain 1 honor',
            when : {
                onPhaseEnded: (event, context) => event.phase === Phases.Conflict && context.player.getProvinces(a => a.isBroken).length < 2
            },
            gameAction: AbilityDsl.actions.gainHonor(context => ({
                target: context.player
            }))
        });
    }
}

PiousGuardian.id = 'pious-guardian';

module.exports = PiousGuardian;
