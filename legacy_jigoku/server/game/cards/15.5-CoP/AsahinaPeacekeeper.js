const DrawCard = require('../../drawcard.js');
const { Players, CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class AsahinaPeacekeeper extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Any,
            targetLocation: Locations.PlayArea,
            match: card => card.getType() === CardTypes.Character,
            effect: AbilityDsl.effects.cardCostToAttackMilitary(1)
        });
    }
}

AsahinaPeacekeeper.id = 'asahina-peacekeeper';

module.exports = AsahinaPeacekeeper;
