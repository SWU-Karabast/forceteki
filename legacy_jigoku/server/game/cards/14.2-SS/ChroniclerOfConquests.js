const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ChroniclerOfConquests extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Gain 1 honor',
            condition: context => context.source.isParticipating() && context.game.isTraitInPlay('battlefield'),
            gameAction: AbilityDsl.actions.gainHonor(context => ({
                target: context.player
            }))
        });
    }
}

ChroniclerOfConquests.id = 'chronicler-of-conquests';

module.exports = ChroniclerOfConquests;
