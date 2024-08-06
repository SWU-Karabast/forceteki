const DrawCard = require('../../drawcard.js');
const { Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class HigashiKazeCompany extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Prevent a character from bowing',
            when: {
                afterConflict: (event, context) => event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card, context) => card.getFate() === 0 && card.isParticipating() && card !== context.source,
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.doesNotBow()
                })
            },
            effect: 'prevent {0} from bowing at the end of the conflict'
        });
    }
}

HigashiKazeCompany.id = 'higashi-kaze-company';

module.exports = HigashiKazeCompany;
