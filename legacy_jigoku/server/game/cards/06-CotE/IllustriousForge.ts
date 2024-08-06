import { CardTypes, Locations, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class IllustriousForge extends ProvinceCard {
    static id = 'illustrious-forge';

    setupCardAbilities() {
        this.reaction({
            title: 'Search for an attachment',
            when: {
                onCardRevealed: (event, context) =>
                    event.card === context.source && context.player.conflictDeck.size() > 0
            },
            effect: 'search the top 5 cards of their conflict deck for an attachment and put it into play',
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.cardMenu((context) => ({
                    activePromptTitle: 'Choose an attachment',
                    cards: context.player.conflictDeck.first(5),
                    cardCondition: (card) => card.type === CardTypes.Attachment,
                    choices: ['Take nothing'],
                    handlers: [
                        () => {
                            this.game.addMessage('{0} takes nothing', context.player);
                            return true;
                        }
                    ],
                    subActionProperties: (card) => ({ attachment: card }),
                    gameAction: AbilityDsl.actions.selectCard({
                        controller: Players.Self,
                        location: Locations.PlayArea,
                        cardType: CardTypes.Character,
                        message: '{0} chooses to attach {1} to {2}',
                        messageArgs: (card, action, properties) => [
                            context.player,
                            (properties as any).attachment,
                            card
                        ],
                        gameAction: AbilityDsl.actions.attach()
                    })
                })),
                AbilityDsl.actions.shuffleDeck((context) => ({
                    deck: Locations.ConflictDeck,
                    target: context.player
                }))
            ])
        });
    }
}
