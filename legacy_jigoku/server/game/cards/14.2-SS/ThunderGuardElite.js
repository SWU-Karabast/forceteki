const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ThunderGuardElite extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Opponent discards a random card',
            condition: context => context.source.isParticipating(),
            cost: AbilityDsl.costs.payHonor(1),
            gameAction: AbilityDsl.actions.discardAtRandom(context => ({
                target: context.player.opponent
            }))
        });
    }
}

ThunderGuardElite.id = 'thunder-guard-elite';

module.exports = ThunderGuardElite;


