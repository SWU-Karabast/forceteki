import { CardTypes, Players } from '../../Constants';
import { BaseOni } from './_BaseOni';
import AbilityDsl = require('../../abilitydsl');

export default class Penanggalan extends BaseOni {
    static id = 'penanggalan';

    public setupCardAbilities() {
        super.setupCardAbilities();
        this.reaction({
            title: 'Move a fate onto this character',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            target: {
                controller: Players.Opponent,
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isTainted && card.isParticipating(),
                gameAction: AbilityDsl.actions.placeFate((context) => ({
                    target: context.source,
                    origin: context.target
                }))
            },
            effect: 'take a fate from {1} and place it on {2}',
            effectArgs: (context) => [context.target, context.source]
        });
    }
}
