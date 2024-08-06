import { CardTypes, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class KotobukisBlessing extends DrawCard {
    static id = 'kotobuki-s-blessing';

    setupCardAbilities() {
        this.action({
            title: 'Place a fate on a character',
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.placeFate({ amount: 1 }),
                    AbilityDsl.actions.selectCard((context) => ({
                        mode: TargetModes.UpTo,
                        numCards: 1,
                        cardType: CardTypes.Attachment,
                        controller: Players.Any,
                        cardCondition: (card) => card.parent === context.target,
                        activePromptTitle: 'Choose up to 1 attachment',
                        optional: true,
                        gameAction: AbilityDsl.actions.discardFromPlay(),
                        message: '{0} chooses to discard {1} from {2}',
                        messageArgs: (cards) => [
                            context.player,
                            cards.length === 0 ? 'no attachments' : cards,
                            context.target
                        ]
                    }))
                ])
            },
            max: AbilityDsl.limit.perRound(1)
        });
    }
}
