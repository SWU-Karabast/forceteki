import { Players, CardTypes } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import { BaseOni } from './_BaseOni';

export default class FouleyesElite extends BaseOni {
    static id = 'fouleye-s-elite';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Bow a character',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            target: {
                controller: Players.Opponent,
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card.getMilitarySkill() <= context.source.getMilitarySkill(),
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}
