const DrawCard = require('../../drawcard.js');
const { Locations, Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class HidaEtsuji extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            match: (card, context) => card.type === CardTypes.Province && card.controller === context.player,
            targetLocation: Locations.Provinces,
            targetController: Players.Self,
            effect: AbilityDsl.effects.increaseLimitOnAbilities()
        });

        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'applyCovert',
                restricts: 'opponentsCardEffects'
            })
        });
    }
}

HidaEtsuji.id = 'hida-etsuji';

module.exports = HidaEtsuji;
