const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes } = require('../../Constants');

class ShibaPureheart extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Honor a character',
            when: {
                onConflictDeclared: (event, context) => {
                    let controller = context.player;
                    let attacker = event.conflict.attackingPlayer;
                    if(attacker === controller.opponent) {
                        return this.game.getConflicts(attacker).filter(conflict => !conflict.passed).length === 2;
                    }
                    return false;
                }
            },
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}

ShibaPureheart.id = 'shiba-pureheart';

module.exports = ShibaPureheart;
