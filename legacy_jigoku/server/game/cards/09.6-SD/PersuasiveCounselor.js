const DrawCard = require('../../drawcard.js');
const { Durations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class PersuasiveCounselor extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Prevent your events from being cancelled',
            condition: context => context.source.isParticipating(),
            effect: 'prevent their events from being cancelled this conflict',
            gameAction: AbilityDsl.actions.playerLastingEffect(context => ({
                duration: Durations.UntilEndOfConflict,
                targetController: context.player,
                effect: AbilityDsl.effects.eventsCannotBeCancelled()
            }))
        });
    }
}

PersuasiveCounselor.id = 'persuasive-counselor';

module.exports = PersuasiveCounselor;
