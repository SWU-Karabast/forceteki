import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';
import type { TriggeredAbilityContext } from '../../TriggeredAbilityContext';

export default class InsultToInjury extends DrawCard {
    static id = 'insult-to-injury';

    setupCardAbilities() {
        this.reaction({
            title: 'Dishonor the loser of a duel',
            when: {
                afterDuel: (event, context) =>
                    (event.winner as Array<DrawCard> | undefined)?.some(
                        (card) => card.controller === context.player && card.hasTrait('duelist')
                    ) ?? false
            },
            gameAction: AbilityDsl.actions.conditional({
                condition: (context: TriggeredAbilityContext<this>) => context.event.loser?.length > 1,
                trueGameAction: AbilityDsl.actions.cardMenu((context) => ({
                    activePromptTitle: 'Choose a character to dishonor',
                    // @ts-ignore
                    cards: context.event.loser,
                    gameAction: AbilityDsl.actions.dishonor(),
                    message: '{0} chooses to dishonor {1}',
                    messageArgs: (card, player) => [player, card]
                })),
                // @ts-ignore
                falseGameAction: AbilityDsl.actions.dishonor((context) => ({ target: context.event.loser[0] }))
            }),
            effect: '{1}',
            effectArgs: (context) => [
                context.event.loser?.length > 1
                    ? 'choose to dishonor a loser of the duel'
                    : ['dishonor {0}', context.event.loser]
            ]
        });
    }
}