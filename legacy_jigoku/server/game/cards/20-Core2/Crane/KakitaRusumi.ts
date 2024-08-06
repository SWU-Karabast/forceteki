import { CardTypes, Decks, Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { AbilityContext } from '../../../AbilityContext';

function statusOfIntern(context: AbilityContext) {
    return (context.source as DrawCard).isHonored ? 'honored' : 'ordinary';
}

export default class KakitaRusumi extends DrawCard {
    static id = 'kakita-rusumi';

    setupCardAbilities() {
        this.action({
            title: 'Put a character into play',
            condition: (context) => context.player.isDefendingPlayer(),
            gameAction: AbilityDsl.actions.deckSearch(() => ({
                activePromptTitle: 'Choose a character to put into play',
                amount: 4,
                deck: Decks.DynastyDeck,
                cardCondition: (card) =>
                    card.type === CardTypes.Character && card.printedCost <= 2 && card.isFaction('crane'),
                message: '{0} puts {1} into play {2}',
                messageArgs: (context, cards) => [context.player, cards, statusOfIntern(context)],
                shuffle: true,
                gameAction: AbilityDsl.actions.putIntoConflict((context) => ({ status: statusOfIntern(context) }))
            })),
            effect: 'search their dynasty deck for a character to put into play',
            then: (context) => ({
                gameAction: AbilityDsl.actions.cardLastingEffect(() => {
                    let target = [];
                    if (context.selects['deckSearch']?.length > 0) {
                        target = context.selects['deckSearch'][0];
                    }
                    return {
                        target: target,
                        duration: Durations.UntilEndOfPhase,
                        effect: AbilityDsl.effects.delayedEffect({
                            when: {
                                onConflictFinished: () => true
                            },
                            message: "{0} is discarded from play due to {1}'s effect",
                            messageArgs: [target, context.source],
                            gameAction: AbilityDsl.actions.discardFromPlay()
                        })
                    };
                })
            })
        });
    }
}