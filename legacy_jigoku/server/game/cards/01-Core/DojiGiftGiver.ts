import { Players, CardTypes } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class DojiGiftGiver extends DrawCard {
    static id = 'doji-gift-giver';

    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            cost: AbilityDsl.costs.giveFateToOpponent(1),
            condition: (context) => context.source.isParticipating() && context.player.opponent !== undefined,
            target: {
                player: Players.Opponent,
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}
