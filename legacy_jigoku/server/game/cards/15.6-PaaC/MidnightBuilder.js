const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Locations, Players } = require('../../Constants');

class MidnightBuilder extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            targetLocation: Locations.Provinces,
            targetController: Players.Self,
            match: card => card.type === CardTypes.Holding,
            effect: AbilityDsl.effects.modifyProvinceStrengthBonus(2)
        });

        this.dire({
            targetLocation: Locations.Provinces,
            targetController: Players.Self,
            match: card => card.type === CardTypes.Holding,
            effect: AbilityDsl.effects.increaseLimitOnAbilities()
        });
    }
}

MidnightBuilder.id = 'midnight-builder';

module.exports = MidnightBuilder;
