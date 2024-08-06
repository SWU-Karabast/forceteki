import { CardTypes, DuelTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class PrudentChallenger extends DrawCard {
    static id = 'prudent-challenger';

    setupCardAbilities() {
        this.action({
            title: 'Initiate a duel to discard attachment',
            initiateDuel: {
                type: DuelTypes.Military,
                message: "{0} chooses one of {1}'s attachments to discard",
                messageArgs: (duel) => [duel.winnerController, duel.loser],
                gameAction: (duel) =>
                    AbilityDsl.actions.selectCard({
                        activePromptTitle: 'Choose an attachment to discard',
                        cardType: CardTypes.Attachment,
                        cardCondition: (card) => duel.loser?.includes(card.parent) ?? false,
                        targets: true,
                        message: '{0} chooses to discard {1}',
                        messageArgs: (card, player) => [player, card],
                        gameAction: AbilityDsl.actions.discardFromPlay()
                    })
            }
        });
    }
}
