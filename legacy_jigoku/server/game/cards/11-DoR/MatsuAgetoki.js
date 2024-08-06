const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class MatsuAgetoki extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move the conflict to another eligible province',
            condition: context => context.player && context.player.opponent && context.player.isMoreHonorable() && context.source.isAttacking(),
            gameAction: AbilityDsl.actions.selectCard(context => ({
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                gameAction: AbilityDsl.actions.moveConflict(),
                message: '{0} moves the conflict to {1}',
                messageArgs: card => [context.player, card]
            })),
            effect: 'move the conflict to another eligible province'
        });
    }
}

MatsuAgetoki.id = 'matsu-agetoki';

module.exports = MatsuAgetoki;
