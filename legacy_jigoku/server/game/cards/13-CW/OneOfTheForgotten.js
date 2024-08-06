const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class OneOfTheForgotten extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            location: Locations.Any,
            effect: AbilityDsl.effects.playerCannot({
                cannot: 'placeFateWhenPlayingCharacterFromProvince',
                restricts: 'source'
            })
        });

        this.reaction({
            title: 'Gain fate',
            when: {
                onConflictPass: (event, context) => context.player.opponent && event.conflict.attackingPlayer === context.player.opponent && context.player.opponent.cardsInPlay.some(card => card.type === CardTypes.Character && !card.bowed)
            },
            gameAction: AbilityDsl.actions.placeFate()
        });
    }
}

OneOfTheForgotten.id = 'one-of-the-forgotten';

module.exports = OneOfTheForgotten;
