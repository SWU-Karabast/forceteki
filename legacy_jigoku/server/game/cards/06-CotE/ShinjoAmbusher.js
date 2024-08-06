const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class ShinjoAmbusher extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Disable a province',
            when: {
                onCardPlayed: (event, context) => event.card === context.source && context.source.isParticipating()
            },
            effect: 'prevent an attacked province from triggering its abilities this conflict',
            gameAction: AbilityDsl.actions.selectCard(context => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: card => card.isConflictProvince(),
                message: '{0} prevents {1} from triggering its abilities',
                messageArgs: cards => [context.player, cards],
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    targetLocation: Locations.Provinces,
                    effect: AbilityDsl.effects.cardCannot('triggerAbilities')
                }))
            }))
        });
    }
}

ShinjoAmbusher.id = 'shinjo-ambusher';

module.exports = ShinjoAmbusher;
