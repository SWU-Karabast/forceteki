import { CardTypes, Decks, PlayTypes } from '../../../Constants';
import { PlayCharacterAsIfFromHandAtHome } from '../../../PlayCharacterAsIfFromHand';
import { PlayDisguisedCharacterAsIfFromHandAtHome } from '../../../PlayDisguisedCharacterAsIfFromHand';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class UtakuTakeko extends DrawCard {
    static id = 'utaku-takeko';

    public setupCardAbilities() {
        this.action({
            title: 'Play character from your discard pile',
            gameAction: AbilityDsl.actions.deckSearch(() => ({
                activePromptTitle: 'Select a character to play',
                amount: 8,
                deck: Decks.DynastyDeck,
                cardCondition: (card) =>
                    card.type === CardTypes.Character &&
                    card.glory >= 1 &&
                    card.isFaction('unicorn') &&
                    !card.isUnique(),
                gameAction: AbilityDsl.actions.playCard((context) => {
                    const target = context.targets[0];
                    return {
                        target,
                        source: this,
                        resetOnCancel: false,
                        playType: PlayTypes.PlayFromHand,
                        playAction: target
                            ? [
                                  new PlayCharacterAsIfFromHandAtHome(target),
                                  new PlayDisguisedCharacterAsIfFromHandAtHome(target)
                              ]
                            : undefined,
                        ignoredRequirements: ['phase']
                    };
                }),

                shuffle: true,
                message: '{0} recalls a {1} relative who is {2} {3}',
                messageArgs: (context, cards) => [
                    context.source,
                    this.#msgDistance(cards[0]),
                    this.#msgArticle(cards[0]),
                    cards[0]
                ]
            }))
        });
    }

    #msgDistance(card: DrawCard): string {
        return card.hasTrait('gaijin') ? 'very distant' : 'distant';
    }

    #msgArticle(card: DrawCard): string {
        if (card.hasTrait('army')) {
            return 'in the';
        }

        switch (card.name[0]) {
            case 'A':
            case 'E':
            case 'I':
            case 'O':
            case 'U':
                return 'an';
            default:
                return 'a';
        }
    }
}
