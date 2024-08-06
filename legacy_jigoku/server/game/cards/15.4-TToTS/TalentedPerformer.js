const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class TalentedPerformer extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.mustBeChosen({ restricts: 'events' })
        });
    }
}

TalentedPerformer.id = 'talented-performer';

module.exports = TalentedPerformer;
