import { CardTypes, Locations, Players } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class GoldenPlainsRaider extends DrawCard {
    static id = 'golden-plains-raider';

    public setupCardAbilities() {
        this.reaction({
            title: 'Discard a card in a province',
            when: {
                afterConflict: (event, context) =>
                    context.source.isAttacking() &&
                    event.conflict.winner === context.source.controller &&
                    context.player.opponent !== undefined
            },
            target: {
                location: Locations.Provinces,
                controller: Players.Opponent,
                cardCondition: (card) => card.isFaceup() && card.type !== CardTypes.Province,
                gameAction: AbilityDsl.actions.discardCard()
            }
        });
    }
}
