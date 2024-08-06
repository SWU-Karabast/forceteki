const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class DesperateNegotiator extends DrawCard {
    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.modifyBothSkills(2)
        });
    }
}

DesperateNegotiator.id = 'desperate-negotiator';

module.exports = DesperateNegotiator;

