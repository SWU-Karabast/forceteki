const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class InsightfulGatekeeper extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.source.isParticipating() && context.player.opponent && context.player.opponent.getClaimedRings().length > context.player.getClaimedRings().length,
            effect: AbilityDsl.effects.modifyMilitarySkill(2)
        });
    }
}

InsightfulGatekeeper.id = 'insightful-gatekeeper';

module.exports = InsightfulGatekeeper;
