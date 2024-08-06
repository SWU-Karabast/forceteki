const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class ChasingTheSun extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move the conflict to another eligible province',
            condition: context => context.player.isAttackingPlayer(),
            cannotBeMirrored: true,
            effect: 'move the conflict to another eligible province',
            gameAction: AbilityDsl.actions.selectCard({
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                message: '{0} moves the conflict to {1}',
                messageArgs: (card, player) => [player, card],
                gameAction: AbilityDsl.actions.moveConflict()
            })
        });
    }
}

ChasingTheSun.id = 'chasing-the-sun';

module.exports = ChasingTheSun;
