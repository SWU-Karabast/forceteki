import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class ICanSwim extends DrawCard {
    static id = 'i-can-swim';

    setupCardAbilities() {
        this.action({
            title: 'Discard a dishonored character',
            condition: (context) => context.player.opponent && context.player.showBid > context.player.opponent.showBid,
            cannotBeMirrored: true,
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card) => card.isParticipating() && card.isDishonored,
                gameAction: AbilityDsl.actions.discardFromPlay()
            }
        });
    }
}
