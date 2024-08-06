import { CardTypes, Players } from '../../Constants';
import { BaseOni } from './_BaseOni';
import AbilityDsl = require('../../abilitydsl');

export default class LostSamurai extends BaseOni {
    static id = 'lost-samurai';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Dishonor a character',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            target: {
                controller: Players.Any,
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating() && !card.isFaction('shadowlands'),
                gameAction: AbilityDsl.actions.dishonor()
            }
        });
    }
}
