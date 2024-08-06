const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class SolitaryStrength extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.delayedEffect({
                condition: context => {
                    if(context.source.parent && context.source.parent.isParticipating()) {
                        let participantsForController = this.game.currentConflict && this.game.currentConflict.getNumberOfParticipantsFor(context.player);
                        let parentOwnedByController = context.source.parent.controller === context.player;
                        if(parentOwnedByController) {
                            participantsForController = Math.max(0, participantsForController - 1);
                        }
                        return participantsForController > 0;
                    }
                    return false;
                },
                message: '{0} is discarded from play as {1} is not participating alone in the conflict',
                messageArgs: context => [context.source, context.source.parent],
                gameAction: AbilityDsl.actions.discardFromPlay()
            })
        });

        this.reaction({
            title: 'Gain 1 honor',
            when: {
                afterConflict: (event, context) => context.source.parent && context.source.parent.isParticipating() &&
                                                   event.conflict.winner === context.source.parent.controller
            },
            gameAction: AbilityDsl.actions.gainHonor()
        });
    }
}

SolitaryStrength.id = 'solitary-strength';

module.exports = SolitaryStrength;
