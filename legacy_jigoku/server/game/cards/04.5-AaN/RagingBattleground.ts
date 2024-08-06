import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class RagingBattleground extends ProvinceCard {
    static id = 'raging-battleground';

    setupCardAbilities() {
        this.reaction({
            title: 'Choose a character to discard',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => !card.isUnique() && card.getFate() < 1,
                gameAction: AbilityDsl.actions.discardFromPlay()
            }
        });
    }
}
