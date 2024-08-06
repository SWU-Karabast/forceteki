import { CardTypes, Players } from '../../Constants';
import { BaseOni } from './_BaseOni';
import AbilityDsl = require('../../abilitydsl');

export default class ShamblingServant extends BaseOni {
    static id = 'shambling-servant';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Taint a character',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            target: {
                controller: Players.Any,
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.taint()
            }
        });
    }
}
