import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class Brushfires extends ProvinceCard {
    static id = 'brushfires';

    setupCardAbilities() {
        this.reaction({
            title: 'Remove 2 fate from an attacking character',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isAttacking(),
                gameAction: AbilityDsl.actions.removeFate({ amount: 2 })
            }
        });
    }
}
