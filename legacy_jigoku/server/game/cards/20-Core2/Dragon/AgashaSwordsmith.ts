import { CardTypes, Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class AgashaSwordsmith extends DrawCard {
    static id = 'agasha-swordsmith';

    setupCardAbilities() {
        this.action({
            title: 'Search top 5 card for attachment',
            limit: AbilityDsl.limit.perRound(1),
            effect: 'look at the top five cards of their deck',
            gameAction: AbilityDsl.actions.deckSearch({
                amount: 5,
                cardCondition: (card) => card.type === CardTypes.Attachment,
                gameAction: AbilityDsl.actions.moveCard({
                    destination: Locations.Hand
                })
            })
        });
    }
}
