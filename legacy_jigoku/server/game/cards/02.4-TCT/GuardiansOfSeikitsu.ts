import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class GuardiansOfTheSeikitsu extends ProvinceCard {
    static id = 'guardians-of-the-seikitsu';

    setupCardAbilities() {
        this.reaction({
            title: 'Bow all characters 2 cost or less',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.bow(() => ({
                target: this.game.findAnyCardsInPlay(
                    (card) => card.getType() === CardTypes.Character && card.costLessThan(3)
                )
            }))
        });
    }
}
