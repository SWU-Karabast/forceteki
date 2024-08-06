const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Players } = require('../../Constants.js');

class SwellOfSeafoam extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Prevent bowing after conflict',
            condition: () => this.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card) => card.isParticipating() && card.hasTrait('monk'),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.cardLastingEffect({
                        effect: AbilityDsl.effects.doesNotBow()
                    }),
                    AbilityDsl.actions.honor((context) => ({
                        target: context.player.isKihoPlayedThisConflict(context, this) ? context.target : []
                    }))
                ])
            },
            effect: '{1}prevent {0} from bowing at the end of the conflict',
            effectArgs: (context) => [context.player.isKihoPlayedThisConflict(context, this) ? 'honor and ' : '']
        });
    }
}

SwellOfSeafoam.id = 'swell-of-seafoam';

module.exports = SwellOfSeafoam;
