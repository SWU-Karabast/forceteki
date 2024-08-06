import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class GiverOfGifts2 extends DrawCard {
    static id = 'giver-of-gifts-2';

    setupCardAbilities() {
        this.action({
            title: 'Move an attachment',
            target: {
                cardType: CardTypes.Attachment,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.selectCard((context) => ({
                    cardCondition: (card) =>
                        card !== context.target.parent && card.controller === context.target.parent.controller,
                    message: '{0} moves {1} to {2}',
                    messageArgs: (card) => [context.player, context.target, card],
                    gameAction: AbilityDsl.actions.attach({ attachment: context.target })
                }))
            },
            effect: 'move {0} to another character'
        });
    }
}
