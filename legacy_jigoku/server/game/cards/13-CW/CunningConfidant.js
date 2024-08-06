const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class CunningConfidant extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.source.isParticipating() && context.player.opponent && context.player.opponent.getClaimedRings().length > context.player.getClaimedRings().length,
            effect: AbilityDsl.effects.modifyPoliticalSkill(2)
        });
    }
}

CunningConfidant.id = 'cunning-confidant';

module.exports = CunningConfidant;
