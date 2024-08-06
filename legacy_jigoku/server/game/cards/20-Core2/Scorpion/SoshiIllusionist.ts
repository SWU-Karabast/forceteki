import AbilityDsl from '../../../abilitydsl';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class SoshiIllusionist extends DrawCard {
    static id = 'soshi-illusionist';

    setupCardAbilities() {
        this.action({
            title: 'Discard status from character',
            cost: AbilityDsl.costs.payFate(1),
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.selectToken((context) => ({
                    card: context.target,
                    activePromptTitle: 'Which token do you wish to discard?',
                    message: '{0} discards {1}',
                    messageArgs: (token, player) => [player, token],
                    gameAction: AbilityDsl.actions.discardStatusToken()
                }))
            },
            effect: 'discard a status token from {0}'
        });
    }
}
