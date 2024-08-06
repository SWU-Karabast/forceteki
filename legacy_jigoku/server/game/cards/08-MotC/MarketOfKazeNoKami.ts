import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class MarketOfKazeNoKami extends ProvinceCard {
    static id = 'market-of-kaze-no-kami';

    setupCardAbilities() {
        this.reaction({
            title: 'Bow a character',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => !card.isHonored,
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}
