import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class LordsAscendancy extends ProvinceCard {
    static id = 'lord-s-ascendancy';

    setupCardAbilities() {
        this.action({
            title: 'Place a fate on a character',
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.placeFate((context) => ({
                    origin: context.target.controller
                }))
            },
            effect: "place a fate from {1}'s fate pool on {0}",
            effectArgs: (context) => [context.target.controller]
        });
    }
}
