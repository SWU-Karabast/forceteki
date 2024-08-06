const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CharacterStatus, CardTypes } = require('../../Constants');

class GuardianDojo extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            targetLocation: Locations.Any,
            match: (card, context) => card.type === CardTypes.Character
                && card.isFaceup()
                && context.player.areLocationsAdjacent(context.source.location, card.location),
            effect: [
                AbilityDsl.effects.entersPlayWithStatus(CharacterStatus.Honored)
            ]
        });

        this.persistentEffect({
            targetLocation: Locations.Any,
            effect: AbilityDsl.effects.playerCannot({
                cannot: 'placeFateWhenPlayingCharacterFromProvince',
                restricts: 'adjacentCharacters'
            })
        });
    }
}

GuardianDojo.id = 'guardian-dojo';

module.exports = GuardianDojo;
