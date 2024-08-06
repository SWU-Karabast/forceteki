import { CardTypes } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class AsakoMaezawa2 extends DrawCard {
    static id = 'asako-maezawa-2';

    public setupCardAbilities() {
        this.reaction({
            title: 'Bow a character with no fate',
            when: {
                afterConflict: (event, context) =>
                    context.source.isParticipating() &&
                    event.conflict.winner === context.source.controller &&
                    context.player.opponent !== undefined
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.getFate() === 0,
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.bow(),
                    AbilityDsl.actions.conditional({
                        condition: (context) => context.target.isFaction('phoenix'),
                        trueGameAction: AbilityDsl.actions.dishonor(),
                        falseGameAction: AbilityDsl.actions.draw({ amount: 0 }) //do nothing
                    })
                ])
            },
            effect: 'bow {0}'
        });
    }
}
