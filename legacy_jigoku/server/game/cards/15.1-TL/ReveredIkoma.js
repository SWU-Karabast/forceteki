const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ReveredIkoma extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            match: card => card === this,
            effect: AbilityDsl.effects.cardCannot('receiveDishonorToken')
        });

        this.action({
            title: 'Gain 1 fate',
            condition: context => context.player.honorGained(context.game.roundNumber, this.game.currentPhase, true) >= 2,
            gameAction: AbilityDsl.actions.gainFate()
        });
    }
}

ReveredIkoma.id = 'revered-ikoma';

module.exports = ReveredIkoma;
