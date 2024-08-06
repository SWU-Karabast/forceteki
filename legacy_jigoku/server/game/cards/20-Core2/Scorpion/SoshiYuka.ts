import { CardTypes, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class SoshiYuka extends DrawCard {
    static id = 'soshi-yuka';

    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            target: {
                mode: TargetModes.Exactly,
                numCards: 2,
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                player: Players.Opponent,
                cardCondition: (card: DrawCard) => !card.bowed
            },
            gameAction: AbilityDsl.actions.selectCard({
                cardType: CardTypes.Character,
                cardCondition: (card, context) => context.target.includes(card),
                gameAction: AbilityDsl.actions.bow(),
                message: '{0} is bowed, as they are dragged into a web of intrigue',
                messageArgs: (card, player) => [card]
            }),
            effect: 'sow discord between {0}'
        });
    }
}
