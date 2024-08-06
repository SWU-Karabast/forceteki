const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class KoboIchiKaiJujutsu extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.attachmentMilitarySkillModifier((card, context) => context.player.opponent ? context.player.opponent.getClaimedRings().length : 0)
        });
    }
}

KoboIchiKaiJujutsu.id = 'kobo-ichi-kai-jujutsu';

module.exports = KoboIchiKaiJujutsu;
