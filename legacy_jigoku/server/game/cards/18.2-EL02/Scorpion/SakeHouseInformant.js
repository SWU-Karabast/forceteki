const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl');
const { FavorTypes } = require('../../../Constants.js');

class SakeHouseInformant extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.game.getFavorSide() === FavorTypes.Military,
            match: card => card.hasTrait('shinobi'),
            effect: AbilityDsl.effects.modifyMilitarySkill(1)
        });

        this.persistentEffect({
            condition: context => context.game.getFavorSide() === FavorTypes.Political,
            match: card => card.hasTrait('shinobi'),
            effect: AbilityDsl.effects.modifyPoliticalSkill(1)
        });
    }
}

SakeHouseInformant.id = 'sake-house-informant';

module.exports = SakeHouseInformant;
