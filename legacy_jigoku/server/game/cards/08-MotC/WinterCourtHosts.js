const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class WinterCourtHosts extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Draw a card',
            limit: AbilityDsl.limit.unlimitedPerConflict(),
            when: {
                onCardPlayed: (event, context) => {
                    return context.player.opponent &&
                        event.player === context.player.opponent &&
                        context.source.isParticipating() &&
                        context.player.isMoreHonorable();
                }
            },
            gameAction: AbilityDsl.actions.draw()
        });
    }
}

WinterCourtHosts.id = 'winter-court-hosts';
module.exports = WinterCourtHosts;

