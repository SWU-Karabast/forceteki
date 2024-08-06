const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { AbilityTypes } = require('../../Constants.js');

class WayWithWords extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                title: 'Take 1 honor',
                when: {
                    afterConflict: (event, context) =>
                        context.source.isParticipating() &&
                        event.conflict.winner === context.source.controller &&
                        context.player.opponent &&
                        event.conflict.conflictType === 'political'
                },
                gameAction: AbilityDsl.actions.takeHonor()
            })
        });
    }
}

WayWithWords.id = 'way-with-words';

module.exports = WayWithWords;
