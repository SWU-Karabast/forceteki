const DrawCard = require('../../drawcard.js');
const { Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ButcherOfTheFallen extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.source.isAttacking(),
            match: (card, context) => card.getMilitarySkill() < context.player.getProvinces(a => !a.isBroken).length,
            targetController: Players.Opponent,
            effect: AbilityDsl.effects.cardCannot('declareAsDefender')});
    }
}
ButcherOfTheFallen.id = 'butcher-of-the-fallen';

module.exports = ButcherOfTheFallen;
