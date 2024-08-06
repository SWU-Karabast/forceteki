const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class BeautifulEntertainer extends DrawCard {
    setupCardAbilities() {
        this.interrupt({
            title: 'Gain 2 Honor',
            when: {
                onCardLeavesPlay: (event, context) => event.card === context.source && context.player.opponent && context.player.isLessHonorable()
            },
            gameAction: AbilityDsl.actions.gainHonor(context => ({
                target: context.player,
                amount: 2
            }))
        });
    }
}

BeautifulEntertainer.id = 'beautiful-entertainer';

module.exports = BeautifulEntertainer;
