const DrawCard = require('../../drawcard.js');
const { Durations, Players, Phases } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class AllOutAssault extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Both players must attack with as many characters as they can every conflict',
            when: {
                onPhaseStarted: event => event.phase === Phases.Conflict
            },
            effect: 'force each player to attack with as many characters as they can each conflict!',
            gameAction: AbilityDsl.actions.playerLastingEffect({
                duration: Durations.UntilEndOfPhase,
                targetController: Players.Any,
                effect: AbilityDsl.effects.mustDeclareMaximumAttackers()
            })
        });
    }
}

AllOutAssault.id = 'all-out-assault';

module.exports = AllOutAssault;
