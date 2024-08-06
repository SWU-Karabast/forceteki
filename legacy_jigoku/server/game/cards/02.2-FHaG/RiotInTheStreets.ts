import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class RiotInTheStreets extends ProvinceCard {
    static id = 'riot-in-the-streets';

    setupCardAbilities() {
        this.action({
            title: 'Bow character if you have 3 participating bushi',
            condition: (context) =>
                context.player.getNumberOfCardsInPlay((card) => card.hasTrait('bushi') && card.isParticipating()) >= 3,
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}
