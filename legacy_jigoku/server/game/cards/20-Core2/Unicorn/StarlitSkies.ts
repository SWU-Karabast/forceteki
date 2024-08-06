import type { AbilityContext } from '../../../AbilityContext';
import { Locations, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

const possibleChoices = {
    'Your Dynasty Deck': {
        condition: (context: AbilityContext) => (context.player?.dynastyDeck.size() ?? 0) > 0,
        cards: (context: AbilityContext): Array<DrawCard> => context.player.dynastyDeck.first(3),
        player: (context: AbilityContext) => context.player
    },
    'Your Conflict Deck': {
        condition: (context: AbilityContext) => (context.player?.conflictDeck.size() ?? 0) > 0,
        cards: (context: AbilityContext): Array<DrawCard> => context.player.conflictDeck.first(3),
        player: (context: AbilityContext) => context.player
    }
} as const;

export default class StarlitSkies extends DrawCard {
    static id = 'starlit-skies';

    setupCardAbilities() {
        this.action({
            title: 'Look at top 3 cards',
            evenDuringDynasty: true,
            target: {
                mode: TargetModes.Select,
                activePromptTitle: 'Choose which deck to look at:',
                choices: Object.fromEntries(
                    Object.entries(possibleChoices).map(([name, { condition }]) => [name, condition])
                )
            },
            effect: "look at the top 3 cards of {1}'s {2}",
            effectArgs: (context) => [context.player, context.select.toLowerCase()],
            handler: (context) => {
                const choice = possibleChoices[context.select as keyof typeof possibleChoices];
                const topThree = choice.cards(context);
                const messages = ['{0} places a card on the bottom of the deck', '{0} chooses to discard {1}'];
                const destinations = [
                    topThree[0].isDynasty ? 'dynasty deck bottom' : 'conflict deck bottom',
                    topThree[0].isDynasty ? Locations.DynastyDiscardPile : Locations.ConflictDiscardPile
                ];
                let choices = [];
                const handlers = [];
                const cardHandler = (card: DrawCard) => {
                    context.game.addMessage(messages.pop(), context.player, card);
                    choice.player(context).moveCard(card, destinations.pop());
                    if (messages.length > 0) {
                        const index = topThree.findIndex((x) => x === card);
                        topThree.splice(index, 1);
                        context.game.promptWithHandlerMenu(context.player, {
                            activePromptTitle: 'Select a card to put on the bottom of the deck',
                            context: context,
                            cards: topThree,
                            cardHandler: cardHandler,
                            handlers: handlers,
                            choices: choices
                        });
                    }
                };
                if (topThree.length < 3) {
                    choices = ['None'];
                    handlers.push(() => {
                        if (topThree.length === 2) {
                            choices.pop();
                            handlers.pop();
                        }
                        messages.pop();
                        destinations.pop();
                        if (messages.length > 0) {
                            context.game.promptWithHandlerMenu(context.player, {
                                activePromptTitle: 'Select a card to put on the bottom of the deck',
                                context: context,
                                cards: topThree,
                                cardHandler: cardHandler,
                                choices: choices,
                                handlers: handlers
                            });
                        }
                    });
                }
                context.game.promptWithHandlerMenu(context.player, {
                    activePromptTitle: 'Select a card to discard',
                    context: context,
                    cards: topThree,
                    cardHandler: cardHandler,
                    handlers: handlers,
                    choices: choices
                });
            }
        });
    }
}
